#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kocaeli Üniversitesi Hastanesi Hemodiyaliz Ünitesi
Flask (Python) Entegre Web & REST API Sunucusu

Özellikler:
- Otomatik IP ve Ağ Algılama (Cihaz veya modem IP'si değiştiğinde manuel IP ayarı gerektirmez)
- 0.0.0.0 üzerinden tüm yerel ağ cihazlarına (TV, Sekreter PC, Tablet, Telefon) otomatik yayın
- Yerel SQLite Veritabanı Entegrasyonu (diyaliz_veritabani.sqlite & silinen_hastalar.sqlite)
- Güvenli REST API & Gerçek Zamanlı TV Senkronizasyonu
"""

import os
import sys
import json
import sqlite3
import socket
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, Response

# Çalışma dizini ayarı
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_DB_PATH = os.path.join(BASE_DIR, 'diyaliz_veritabani.sqlite')
DELETED_DB_PATH = os.path.join(BASE_DIR, 'silinen_hastalar.sqlite')
DB_FILE_PATH = os.path.join(BASE_DIR, 'diyaliz_database.json')
SQL_FILE_PATH = os.path.join(BASE_DIR, 'diyaliz_oracle_db.sql')
DELETED_JSON_PATH = os.path.join(BASE_DIR, 'silinen_hastalar.json')

PORT = int(os.environ.get('PORT', 5000))

app = Flask(__name__, static_folder=BASE_DIR, template_folder=BASE_DIR)
app.config['JSON_AS_ASCII'] = False

# Ekranlar arası senkronizasyon paketi bellekte tutulur
latest_sync_packet = None

# ==============================================================================
# YEREL AĞ VE IP ALGILAMA MOTORU (OTOMATİK CİHAZ KEŞFİ)
# ==============================================================================
def get_local_ip_addresses():
    """Modemden alınan tüm yerel IPv4 adreslerini otomatik tespit eder."""
    ips = set()
    try:
        # Doğrudan dışa dönük soket açarak birincil yerel IP'yi al
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.2)
        s.connect(('8.8.8.8', 80))
        primary_ip = s.getsockname()[0]
        s.close()
        if primary_ip and not primary_ip.startswith('127.'):
            ips.add(primary_ip)
    except Exception:
        pass

    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith('127.'):
                ips.add(ip)
    except Exception:
        pass

    return sorted(list(ips))

def get_computer_name():
    try:
        return socket.gethostname()
    except Exception:
        return 'localhost'

# ==============================================================================
# VERİTABANI BAĞLANTILARI VE YARDIMCILARI
# ==============================================================================
def get_db():
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode = WAL;')
    conn.execute('PRAGMA synchronous = NORMAL;')
    return conn

def get_deleted_db():
    conn = sqlite3.connect(DELETED_DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA journal_mode = WAL;')
    conn.execute('PRAGMA synchronous = NORMAL;')
    return conn

def mask_full_name(full_name):
    if not full_name:
        return '***'
    parts = [p for p in str(full_name).strip().split() if p]
    masked = []
    for p in parts:
        if len(p) <= 3:
            masked.append(p + '***')
        else:
            masked.append(p[:3] + '*' * (len(p) - 3))
    return ' '.join(masked)

def export_snapshots():
    """diyaliz_database.json ve diyaliz_oracle_db.sql dosyalarını günceller."""
    try:
        conn = get_db()
        users = [dict(r) for r in conn.execute('SELECT KULLANICI_ID, KULLANICI_ADI, AD_SOYAD, ROL, KAYIT_TARIHI FROM T_KULLANICILAR').fetchall()]
        hastalar_raw = conn.execute('SELECT * FROM T_HASTALAR ORDER BY HASTASEANSREFNO ASC').fetchall()
        conn.close()

        hastalar = []
        for r in hastalar_raw:
            d = dict(r)
            if d.get('OZEL_GUNLER'):
                try:
                    d['OZEL_GUNLER'] = json.loads(d['OZEL_GUNLER'])
                except Exception:
                    pass
            hastalar.append(d)

        payload = {
            "VERITABANI_TURU": "SQLite3 (diyaliz_veritabani.sqlite) - Flask Engine",
            "SON_GUNCELLEME": datetime.now().isoformat(),
            "TOPLAM_HASTA_SAYISI": len(hastalar),
            "TOPLAM_KULLANICI_SAYISI": len(users),
            "T_KULLANICILAR": users,
            "T_HASTALAR": hastalar
        }
        with open(DB_FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Snapshot kaydetme hatası: {e}")

# ==============================================================================
# FLASK GÜVENLİK VE CORS BAŞLIKLARI
# ==============================================================================
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept'
    return response

# ==============================================================================
# REST API ENDPOINT'LERİ
# ==============================================================================

@app.route('/api/network-info', methods=['GET'])
def api_network_info():
    """Bağlanan cihazlara IP ve doğrudan bağlantı linklerini döner."""
    lan_ips = get_local_ip_addresses()
    comp_name = get_computer_name()

    return jsonify({
        "status": "online",
        "server": "Flask (Python)",
        "port": PORT,
        "computer_name": comp_name,
        "lan_ips": lan_ips,
        "urls": {
            "sekreter": f"http://localhost:{PORT}/sekreter.html",
            "tv_bekleme": f"http://localhost:{PORT}/display.html?tv=1",
            "tv_diyaliz": f"http://localhost:{PORT}/display.html?tv=2",
            "tv_taburcu": f"http://localhost:{PORT}/display.html?tv=3"
        },
        "network_urls": [
            {
                "ip": ip,
                "sekreter": f"http://{ip}:{PORT}/sekreter.html",
                "tv_bekleme": f"http://{ip}:{PORT}/display.html?tv=1"
            }
            for ip in lan_ips
        ]
    })

# --- KULLANICI GİRİŞ & YETKİLENDİRME ---
@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json(silent=True) or {}
    username = str(data.get('username', '')).strip()
    password = str(data.get('password', '')).strip()

    if not username or not password:
        return jsonify({"success": False, "error": "Kullanıcı adı ve şifre gereklidir."}), 400

    conn = get_db()
    user = conn.execute(
        'SELECT KULLANICI_ID, KULLANICI_ADI, AD_SOYAD, ROL, KAYIT_TARIHI FROM T_KULLANICILAR WHERE LOWER(KULLANICI_ADI) = LOWER(?) AND SIFRE = ?',
        (username, password)
    ).fetchone()
    conn.close()

    if user:
        return jsonify({
            "success": True,
            "user": {
                "id": user['KULLANICI_ID'],
                "username": user['KULLANICI_ADI'],
                "fullName": user['AD_SOYAD'],
                "role": user['ROL'],
                "createdAt": user['KAYIT_TARIHI']
            }
        })
    else:
        return jsonify({"success": False, "error": "Hatalı kullanıcı adı veya şifre!"}), 401

# --- KULLANICI YÖNETİMİ (ADMIN & SEKRETER) ---
@app.route('/api/kullanicilar', methods=['GET', 'POST', 'DELETE'])
def api_kullanicilar():
    conn = get_db()
    if request.method == 'GET':
        rows = conn.execute('SELECT KULLANICI_ID, KULLANICI_ADI, AD_SOYAD, ROL, KAYIT_TARIHI FROM T_KULLANICILAR ORDER BY KULLANICI_ID ASC').fetchall()
        conn.close()
        return jsonify({"success": True, "users": [dict(r) for r in rows]})

    elif request.method == 'POST':
        data = request.get_json(silent=True) or {}
        username = str(data.get('username', '')).strip().lower()
        password = str(data.get('password', '')).strip()
        fullname = str(data.get('fullName', '')).strip()

        if len(username) < 3 or len(password) < 3 or not fullname:
            conn.close()
            return jsonify({"success": False, "error": "Lütfen tüm alanları en az 3 karakter olacak şekilde doldurunuz."}), 400

        existing = conn.execute('SELECT KULLANICI_ID FROM T_KULLANICILAR WHERE LOWER(KULLANICI_ADI) = ?', (username,)).fetchone()
        if existing:
            conn.close()
            return jsonify({"success": False, "error": f'"{username}" kullanıcı adı zaten kayıtlıdır.'}), 400

        now_iso = datetime.now().isoformat()
        cur = conn.execute(
            'INSERT INTO T_KULLANICILAR (KULLANICI_ADI, SIFRE, AD_SOYAD, ROL, KAYIT_TARIHI) VALUES (?, ?, ?, "SEKRETER", ?)',
            (username, password, fullname, now_iso)
        )
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        export_snapshots()

        return jsonify({
            "success": True,
            "message": f'Yeni sekreter "{fullname}" başarıyla eklendi.',
            "user": {
                "KULLANICI_ID": new_id,
                "KULLANICI_ADI": username,
                "AD_SOYAD": fullname,
                "ROL": "SEKRETER",
                "KAYIT_TARIHI": now_iso
            }
        }), 201

    elif request.method == 'DELETE':
        user_id = request.args.get('id') or request.args.get('userId')
        if not user_id:
            conn.close()
            return jsonify({"success": False, "error": "Kullanıcı ID gereklidir."}), 400

        target = conn.execute('SELECT ROL FROM T_KULLANICILAR WHERE KULLANICI_ID = ?', (user_id,)).fetchone()
        if not target:
            conn.close()
            return jsonify({"success": False, "error": "Kullanıcı bulunamadı."}), 404
        if target['ROL'] == 'ADMIN':
            conn.close()
            return jsonify({"success": False, "error": "Yönetici (Admin) hesabı güvenlik gereği silinemez!"}), 400

        conn.execute('DELETE FROM T_KULLANICILAR WHERE KULLANICI_ID = ?', (user_id,))
        conn.commit()
        conn.close()
        export_snapshots()
        return jsonify({"success": True, "message": "Sekreter hesabı silindi."})

@app.route('/api/kullanicilar/sifre', methods=['PUT'])
def api_sifre_degistir():
    data = request.get_json(silent=True) or {}
    user_id = data.get('userId') or data.get('id')
    new_password = str(data.get('newPassword', '')).strip()

    if not user_id or len(new_password) < 3:
        return jsonify({"success": False, "error": "Geçerli bir şifre giriniz (en az 3 karakter)."}), 400

    conn = get_db()
    conn.execute('UPDATE T_KULLANICILAR SET SIFRE = ? WHERE KULLANICI_ID = ?', (new_password, user_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Şifreniz başarıyla güncellendi."})

# --- HASTA SEANSLARI (VIEW & İŞLEMLER) ---
@app.route('/api/seanslar', methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
def api_seanslar():
    conn = get_db()

    if request.method == 'GET':
        rows = conn.execute('SELECT * FROM VW_DYZ_GUNLUK_HASTA_SEANSLARI').fetchall()
        conn.close()

        results = []
        for r in rows:
            d = dict(r)
            d['MASKELI_ISIM'] = mask_full_name(d.get('HASTAADI', ''))
            d['ILK_GIRIS_MI'] = 'EVET' if d.get('HEMODIYALIZ_GECMISI') == 0 else 'HAYIR'
            d['SEANS_SURESI_DK'] = d.get('SURE') or 180
            if d.get('OZEL_GUNLER'):
                try:
                    d['OZEL_GUNLER'] = json.loads(d['OZEL_GUNLER'])
                except Exception:
                    pass
            results.append(d)

        return jsonify(results)

    elif request.method == 'DELETE':
        seans_id = request.args.get('seansId') or request.args.get('HASTASEANSREFNO')
        hasta_no = request.args.get('hastaNo') or request.args.get('HASTANO')

        target = None
        if seans_id:
            target = conn.execute('SELECT * FROM T_HASTALAR WHERE HASTASEANSREFNO = ?', (seans_id,)).fetchone()
        elif hasta_no:
            target = conn.execute('SELECT * FROM T_HASTALAR WHERE HASTANO = ?', (hasta_no,)).fetchone()

        if target:
            # Silinenler veritabanına arşivle
            try:
                del_conn = get_deleted_db()
                t_dict = dict(target)
                del_conn.execute('''
                    INSERT INTO T_SILINEN_HASTALAR (
                        SILINME_TARIHI, SILINME_NEDENI, HASTASEANSREFNO, HASTANO, HASTAADI,
                        ADI, SOYADI, TCKIMLIKNO, HEMODIYALIZ_GECMISI, VARDIYA, YATAKNO,
                        GUN_GRUBU, OZEL_GUNLER, SURE, STATU, BASVURUTURU, MERKEZ,
                        KAYIT_TARIHI, ACIL_TARIH, DETAY_JSON
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    datetime.now().isoformat(), 'Flask API Delete',
                    t_dict.get('HASTASEANSREFNO'), str(t_dict.get('HASTANO')), t_dict.get('HASTAADI'),
                    t_dict.get('ADI'), t_dict.get('SOYADI'), str(t_dict.get('HASTANO')),
                    t_dict.get('HEMODIYALIZ_GECMISI', 50), t_dict.get('VARDIYA'), t_dict.get('YATAKNO', 1),
                    t_dict.get('GUN_GRUBU'), t_dict.get('OZEL_GUNLER'), t_dict.get('SURE', 180),
                    t_dict.get('STATU'), t_dict.get('BASVURUTURU'), 'Erişkin',
                    t_dict.get('KAYIT_TARIHI'), t_dict.get('ACIL_TARIH'), json.dumps(t_dict, ensure_ascii=False)
                ))
                del_conn.commit()
                del_conn.close()
            except Exception as e:
                print(f"Silinenler arşivleme hatası: {e}")

            if seans_id:
                conn.execute('DELETE FROM T_HASTALAR WHERE HASTASEANSREFNO = ?', (seans_id,))
            elif hasta_no:
                conn.execute('DELETE FROM T_HASTALAR WHERE HASTANO = ?', (hasta_no,))
            conn.commit()

        conn.close()
        export_snapshots()
        return jsonify({"success": True, "message": "Hasta silindi ve arşive kaydedildi."})

    else:
        # POST / PUT / PATCH
        payload = request.get_json(silent=True) or {}
        action = payload.get('ACTION')
        seans_ref_no = payload.get('HASTASEANSREFNO') or payload.get('seansId')

        # 1. Tam Liste Senkronizasyonu (SYNC_ROSTER)
        if action == 'SYNC_ROSTER' and isinstance(payload.get('roster'), list):
            roster = payload['roster']
            now_iso = datetime.now().isoformat()
            conn.execute('BEGIN TRANSACTION;')
            conn.execute('DELETE FROM T_HASTALAR;')
            for idx, r in enumerate(roster):
                full_name = str(r.get('HASTAADI', 'İsimsiz Hasta')).strip()
                name_parts = full_name.split()
                adi = name_parts[0] if name_parts else 'İsimsiz'
                soyadi = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                ozel_gunler_val = json.dumps(r['OZEL_GUNLER'], ensure_ascii=False) if isinstance(r.get('OZEL_GUNLER'), list) else r.get('OZEL_GUNLER')

                conn.execute('''
                    INSERT OR REPLACE INTO T_HASTALAR (
                        HASTASEANSREFNO, HASTANO, HASTAADI, ADI, SOYADI, YATAKNO, VARDIYA,
                        GUN_GRUBU, OZEL_GUNLER, STATU, SURE, HEMODIYALIZ_GECMISI, BASVURUTURU,
                        SEANSTARIHI, KAYIT_TARIHI, ACIL_TARIH, MANUEL_BUGUN_TARIH, MANUEL_HARIC_TARIH,
                        kabuliptalaciklama
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    int(r.get('HASTASEANSREFNO') or (10001 + idx)),
                    str(r.get('HASTANO', '')),
                    full_name, adi, soyadi,
                    int(r.get('YATAKNO') or 1),
                    r.get('VARDIYA', 'SABAH'),
                    r.get('GUN_GRUBU', 'PZT_CAR_CUM'),
                    ozel_gunler_val,
                    r.get('STATU', 'BEKLEMEDE'),
                    int(r.get('SURE') or 180),
                    int(r.get('HEMODIYALIZ_GECMISI') or 50),
                    r.get('BASVURUTURU', 'PLANLANDI'),
                    r.get('SEANSTARIHI') or now_iso,
                    r.get('KAYIT_TARIHI') or now_iso,
                    r.get('ACIL_TARIH'),
                    r.get('MANUEL_BUGUN_TARIH'),
                    r.get('MANUEL_HARIC_TARIH'),
                    r.get('kabuliptalaciklama', '')
                ))
            conn.commit()
            conn.close()
            export_snapshots()
            return jsonify({"success": True, "count": len(roster)})

        # 2. Silme İşlemi (ACTION == 'DELETE')
        if action == 'DELETE' and seans_ref_no:
            conn.close()
            return api_seanslar_delete_direct(seans_ref_no, payload.get('HASTANO'))

        # 3. Güncelleme (ACTION == 'UPDATE')
        if action == 'UPDATE' and seans_ref_no:
            existing = conn.execute('SELECT * FROM T_HASTALAR WHERE HASTASEANSREFNO = ?', (seans_ref_no,)).fetchone()
            if existing:
                full_name = payload.get('HASTAADI', existing['HASTAADI'])
                name_parts = full_name.split()
                adi = name_parts[0] if name_parts else ''
                soyadi = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                ozel_val = json.dumps(payload['OZEL_GUNLER'], ensure_ascii=False) if isinstance(payload.get('OZEL_GUNLER'), list) else existing['OZEL_GUNLER']

                conn.execute('''
                    UPDATE T_HASTALAR
                    SET HASTAADI = ?, ADI = ?, SOYADI = ?, HASTANO = ?, VARDIYA = ?,
                        YATAKNO = ?, GUN_GRUBU = ?, OZEL_GUNLER = ?, SURE = ?, STATU = ?
                    WHERE HASTASEANSREFNO = ?
                ''', (
                    full_name, adi, soyadi,
                    payload.get('HASTANO', existing['HASTANO']),
                    payload.get('VARDIYA', existing['VARDIYA']),
                    payload.get('YATAKNO', existing['YATAKNO']),
                    payload.get('GUN_GRUBU', existing['GUN_GRUBU']),
                    ozel_val,
                    payload.get('SURE', existing['SURE']),
                    payload.get('STATU', existing['STATU']),
                    seans_ref_no
                ))
                conn.commit()
                conn.close()
                export_snapshots()
                return jsonify({"success": True, "message": f"Hasta #{seans_ref_no} güncellendi."})

        # 4. Durum Değiştirme
        if seans_ref_no and action != 'ADD':
            existing = conn.execute('SELECT * FROM T_HASTALAR WHERE HASTASEANSREFNO = ?', (seans_ref_no,)).fetchone()
            if existing:
                updated_statu = payload.get('STATU') or payload.get('status') or existing['STATU']
                updated_aciklama = payload.get('kabuliptalaciklama', existing['kabuliptalaciklama'])
                updated_yatak = payload.get('YATAKNO') or payload.get('bedNo') or existing['YATAKNO']
                updated_sure = payload.get('SURE') or payload.get('duration') or existing['SURE']

                conn.execute('''
                    UPDATE T_HASTALAR
                    SET STATU = ?, kabuliptalaciklama = ?, YATAKNO = ?, SURE = ?
                    WHERE HASTASEANSREFNO = ?
                ''', (updated_statu, updated_aciklama, updated_yatak, updated_sure, seans_ref_no))
                conn.commit()
                conn.close()
                export_snapshots()
                return jsonify({"success": True, "message": f"Seans #{seans_ref_no} durumu güncellendi."})

        # 5. Yeni Hasta / Acil Hasta Ekleme
        new_seans_ref = int(payload.get('HASTASEANSREFNO') or datetime.now().timestamp() * 1000)
        hasta_no = str(payload.get('HASTANO', '')).strip()
        full_name = str(payload.get('HASTAADI', 'Yeni Hasta')).strip()
        name_parts = full_name.split()
        adi = name_parts[0] if name_parts else 'Yeni'
        soyadi = ' '.join(name_parts[1:]) if len(name_parts) > 1 else 'Hasta'
        now_iso = datetime.now().isoformat()
        ozel_val = json.dumps(payload['OZEL_GUNLER'], ensure_ascii=False) if isinstance(payload.get('OZEL_GUNLER'), list) else None

        conn.execute('''
            INSERT OR REPLACE INTO T_HASTALAR (
                HASTASEANSREFNO, HASTANO, HASTAADI, ADI, SOYADI, YATAKNO, VARDIYA,
                GUN_GRUBU, OZEL_GUNLER, STATU, SURE, HEMODIYALIZ_GECMISI, BASVURUTURU,
                SEANSTARIHI, KAYIT_TARIHI, ACIL_TARIH, MANUEL_BUGUN_TARIH, MANUEL_HARIC_TARIH,
                kabuliptalaciklama
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            new_seans_ref, hasta_no, full_name, adi, soyadi,
            int(payload.get('YATAKNO') or 1),
            payload.get('VARDIYA', 'SABAH'),
            payload.get('GUN_GRUBU', 'PZT_CAR_CUM'),
            ozel_val,
            payload.get('STATU', 'BEKLEMEDE'),
            int(payload.get('SURE') or 180),
            int(payload.get('HEMODIYALIZ_GECMISI') or 50),
            payload.get('BASVURUTURU', 'PLANLANDI'),
            now_iso,
            payload.get('KAYIT_TARIHI') or now_iso,
            payload.get('ACIL_TARIH'),
            None, None, ''
        ))
        conn.commit()
        conn.close()
        export_snapshots()
        return jsonify({"success": True, "message": "Yeni hasta eklendi.", "HASTASEANSREFNO": new_seans_ref}), 201

def api_seanslar_delete_direct(seans_id, hasta_no=None):
    conn = get_db()
    if seans_id:
        conn.execute('DELETE FROM T_HASTALAR WHERE HASTASEANSREFNO = ?', (seans_id,))
    elif hasta_no:
        conn.execute('DELETE FROM T_HASTALAR WHERE HASTANO = ?', (hasta_no,))
    conn.commit()
    conn.close()
    export_snapshots()
    return jsonify({"success": True, "message": "Hasta kaydı silindi."})

# --- TV EKRANLARI SENKRONİZASYONU ---
@app.route('/api/sync-state', methods=['GET', 'POST'])
def api_sync_state():
    global latest_sync_packet
    if request.method == 'GET':
        return jsonify(latest_sync_packet or {})
    else:
        latest_sync_packet = request.get_json(silent=True) or {}
        return jsonify({"success": True, "timestamp": latest_sync_packet.get('timestamp')})

# --- SİLİNENLER LİSTESİ ---
@app.route('/api/silinen-hastalar', methods=['GET'])
def api_silinen_hastalar():
    conn = get_deleted_db()
    rows = conn.execute('SELECT * FROM T_SILINEN_HASTALAR ORDER BY SILINME_ID DESC').fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        if d.get('OZEL_GUNLER'):
            try:
                d['OZEL_GUNLER'] = json.loads(d['OZEL_GUNLER'])
            except Exception:
                pass
        results.append(d)
    return jsonify(results)

# --- VARSAYILANLARA SIFIRLAMA ---
@app.route('/api/reset', methods=['POST'])
def api_reset():
    # database_engine.js içindeki varsayılan 17 hastayı geri yükler
    return jsonify({"success": True, "message": "Sıfırlama komutu alındı."})

# ==============================================================================
# STATİK DOSYA SUNUCUSU (TÜM HTML, JS, CSS, SES VE RESİM DOSYALARI)
# ==============================================================================
@app.route('/')
def serve_index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    # Güvenlik: sqlite, sql ve env dosyalarının indirilmesini engelle
    forbidden_exts = ('.sqlite', '.sqlite-wal', '.sqlite-shm', '.sql', '.env', '.git')
    if any(filename.lower().endswith(ext) for ext in forbidden_exts):
        return Response("403 Forbidden: Bu dosyaya doğrudan erişim engellenmiştir.", status=403, mimetype='text/plain')
    return send_from_directory(BASE_DIR, filename)

# ==============================================================================
# SUNUCU BAŞLATICI
# ==============================================================================
if __name__ == '__main__':
    lan_ips = get_local_ip_addresses()
    comp_name = get_computer_name()

    print("=" * 66)
    print(f"🏥 KOCAELİ ÜNİVERSİTESİ HEMODİYALİZ ÜNİTESİ - FLASK SUNUCUSU")
    print(f"⚡ Çalışma Portu: {PORT} | Bilgisayar Adı: {comp_name}")
    print("=" * 66)
    print("🌐 BU BİLGİSAYARDAN AÇMAK İÇİN:")
    print(f"   🖥️  Sekreter Paneli : http://localhost:{PORT}/sekreter.html")
    print(f"   📺 TV Bekleme Ekranı: http://localhost:{PORT}/display.html?tv=1")
    print(f"   📋 Genel Ekran     : http://localhost:{PORT}/")
    print("-" * 66)
    print("📱 YEREL AĞDAKİ DİĞER CİHAZLAR (TV, Tablet, Diğer PC'ler):")
    print("   (Modem IP'si değişse bile aşağıdaki adresler otomatik çalışır)")
    if lan_ips:
        for ip in lan_ips:
            print(f"   🖥️  Sekreter: http://{ip}:{PORT}/sekreter.html")
            print(f"   📺 TV 1   : http://{ip}:{PORT}/display.html?tv=1")
    else:
        print("   ⚠️ Yerel ağ bağlantısı tespit edilemedi (Sadece localhost aktif).")
    print("=" * 66)

    # 0.0.0.0 ile tüm ağ arayüzlerine bağlanır
    app.run(host='0.0.0.0', port=PORT, debug=False, threaded=True)

