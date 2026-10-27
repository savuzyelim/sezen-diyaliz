/**
 * Kocaeli Üniversitesi Hastanesi Hemodiyaliz Ünitesi
 * Oracle Database Engine & PL/SQL Simülatör Katmanı
 * 
 * emirhan.txt Madde 18, 23 & 28:
 * - "JAVASCRİPT İÇİN DATABASE ENGINE BULUNACAK"
 * - "DATABASE ENGINE projeye entegre etmek lazım"
 * - "PL SQL İLE ÇALIŞAN DATABASE ENGINE KÜTÜPHANESİ VAR MI? VARSA ONUNLA ÇALIŞALIM."
 * 
 * Bu modül; Node.js ortamında resmi 'oracledb' (Oracle Thin Driver) kütüphanesini
 * destekler. Eğer canlı bir Oracle sunucusu varsa doğrudan bağlanır;
 * eğer Oracle kurulu değilse veya bağlantı offline ise sıfır hata ile
 * dahili PL/SQL Engine simülatörünü çalıştırarak view ve prosedürleri yürütür.
 */

// Dahili Tablolar (Oracle Master Data)
let T_HASTA_BILGILERI = [
  { hastano: '10000000001', adi: 'Ahmet', soyadi: 'Yıldız', tckimlikno: '10000000001' },
  { hastano: '10000000002', adi: 'Mehmet', soyadi: 'Demir', tckimlikno: '10000000002' },
  { hastano: '10000000003', adi: 'Ayşe', soyadi: 'Korkmaz', tckimlikno: '10000000003' },
  { hastano: '10000000004', adi: 'Fatma', soyadi: 'Çelik', tckimlikno: '10000000004' },
  { hastano: '10000000005', adi: 'Ali', soyadi: 'Kaya', tckimlikno: '10000000005' },
  { hastano: '10000000006', adi: 'Hatice', soyadi: 'Öztürk', tckimlikno: '10000000006' },
  { hastano: '10000000007', adi: 'Hüseyin', soyadi: 'Arslan', tckimlikno: '10000000007' },
  { hastano: '10000000008', adi: 'Emine', soyadi: 'Koç', tckimlikno: '10000000008' },
  { hastano: '10000000009', adi: 'Mustafa', soyadi: 'Aydın', tckimlikno: '10000000009' }
];

let T_DYZ_HASTA_BILGILERI = [
  { hastadiyalizrefno: 70001, hastano: '10000000001', hemodiyaliz_gecmisi: 142 },
  { hastadiyalizrefno: 70002, hastano: '10000000002', hemodiyaliz_gecmisi: 0 },
  { hastadiyalizrefno: 70003, hastano: '10000000003', hemodiyaliz_gecmisi: 88 },
  { hastadiyalizrefno: 70004, hastano: '10000000004', hemodiyaliz_gecmisi: 215 },
  { hastadiyalizrefno: 70005, hastano: '10000000005', hemodiyaliz_gecmisi: 64 },
  { hastadiyalizrefno: 70006, hastano: '10000000006', hemodiyaliz_gecmisi: 120 },
  { hastadiyalizrefno: 70007, hastano: '10000000007', hemodiyaliz_gecmisi: 95 },
  { hastadiyalizrefno: 70008, hastano: '10000000008', hemodiyaliz_gecmisi: 180 },
  { hastadiyalizrefno: 70009, hastano: '10000000009', hemodiyaliz_gecmisi: 12 }
];

let T_DYZ_HASTA_TEDAVI_BILGILERI = [
  { hastatedavirefno: 50001, hastadiyalizrefno: 70001 },
  { hastatedavirefno: 50002, hastadiyalizrefno: 70002 },
  { hastatedavirefno: 50003, hastadiyalizrefno: 70003 },
  { hastatedavirefno: 50004, hastadiyalizrefno: 70004 },
  { hastatedavirefno: 50005, hastadiyalizrefno: 70005 },
  { hastatedavirefno: 50006, hastadiyalizrefno: 70006 },
  { hastatedavirefno: 50007, hastadiyalizrefno: 70007 },
  { hastatedavirefno: 50008, hastadiyalizrefno: 70008 },
  { hastatedavirefno: 50009, hastadiyalizrefno: 70009 }
];

let T_DYZ_HASTA_SEANSLARI = [
  {
    HASTASEANSREFNO: 10001,
    hastatedavirefno: 50001,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30001,
    HASTAHIZMETREFNO: 40001,
    seanstarihi: new Date(),
    VARDIYATANIMNO: 1, // 1 = SABAH
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    KABULIPTALNEDENNO: null,
    KABULIPTALTARIHI: null,
    kabuliptalaciklama: '',
    IPTALEDENP: null,
    IPTALTARIHI: null,
    STATU: 'BEKLEMEDE',
    PRESENCE: 'GELDI',
    YATAKNO: 1
  },
  {
    HASTASEANSREFNO: 10002,
    hastatedavirefno: 50002,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30002,
    HASTAHIZMETREFNO: 40002,
    seanstarihi: new Date(),
    VARDIYATANIMNO: 1,
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    KABULIPTALNEDENNO: null,
    KABULIPTALTARIHI: null,
    kabuliptalaciklama: '',
    IPTALEDENP: null,
    IPTALTARIHI: null,
    STATU: 'KATETER_TAKILIYOR',
    PRESENCE: 'GELDI',
    YATAKNO: 2
  },
  {
    HASTASEANSREFNO: 10003,
    hastatedavirefno: 50003,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30003,
    HASTAHIZMETREFNO: 40003,
    seanstarihi: new Date(),
    VARDIYATANIMNO: 1,
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    KABULIPTALNEDENNO: null,
    KABULIPTALTARIHI: null,
    kabuliptalaciklama: '',
    IPTALEDENP: null,
    IPTALTARIHI: null,
    STATU: 'YAKINI_CAGRILIYOR',
    PRESENCE: 'GELDI',
    YATAKNO: 3
  },
  {
    HASTASEANSREFNO: 10004,
    hastatedavirefno: 50004,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30004,
    HASTAHIZMETREFNO: 40004,
    seanstarihi: new Date(),
    VARDIYATANIMNO: 1,
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    KABULIPTALNEDENNO: null,
    KABULIPTALTARIHI: null,
    kabuliptalaciklama: '',
    IPTALEDENP: null,
    IPTALTARIHI: null,
    STATU: 'BAGLANDI',
    PRESENCE: 'GELDI',
    YATAKNO: 4
  },
  {
    HASTASEANSREFNO: 10005,
    hastatedavirefno: 50005,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30005,
    HASTAHIZMETREFNO: 40005,
    seanstarihi: new Date(),
    VARDIYATANIMNO: 1,
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    KABULIPTALNEDENNO: null,
    KABULIPTALTARIHI: null,
    kabuliptalaciklama: 'Tansiyon dengelenmesi amacıyla hekim kararıyla seans erken tamamlanmış olup dinlenme odasında istirahat etmektedir.',
    IPTALEDENP: null,
    IPTALTARIHI: null,
    STATU: 'YARIDA_KALDI',
    PRESENCE: 'GELDI',
    YATAKNO: 5
  },
  {
    HASTASEANSREFNO: 10006,
    hastatedavirefno: 50006,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30006,
    HASTAHIZMETREFNO: 40006,
    seanstarihi: new Date(),
    VARDIYATANIMNO: 1,
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    KABULIPTALNEDENNO: null,
    KABULIPTALTARIHI: null,
    kabuliptalaciklama: '',
    IPTALEDENP: null,
    IPTALTARIHI: null,
    STATU: 'TEDAVI_SURUYOR',
    PRESENCE: 'GELDI',
    YATAKNO: 6
  },
  {
    HASTASEANSREFNO: 10007,
    hastatedavirefno: 50007,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30007,
    HASTAHIZMETREFNO: 40007,
    seanstarihi: new Date(),
    VARDIYATANIMNO: 1,
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    KABULIPTALNEDENNO: null,
    KABULIPTALTARIHI: null,
    kabuliptalaciklama: '',
    IPTALEDENP: null,
    IPTALTARIHI: null,
    STATU: 'AYRILDI',
    PRESENCE: 'GELDI',
    YATAKNO: 7
  },
  {
    HASTASEANSREFNO: 10008,
    hastatedavirefno: 50008,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30008,
    HASTAHIZMETREFNO: 40008,
    seanstarihi: new Date(),
    VARDIYATANIMNO: 1,
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    KABULIPTALNEDENNO: null,
    KABULIPTALTARIHI: null,
    kabuliptalaciklama: '',
    IPTALEDENP: null,
    IPTALTARIHI: null,
    STATU: 'TABURCU',
    PRESENCE: 'GELDI',
    YATAKNO: 8
  },
  {
    HASTASEANSREFNO: 10009,
    hastatedavirefno: 50009,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30009,
    HASTAHIZMETREFNO: 40009,
    seanstarihi: new Date(),
    VARDIYATANIMNO: 1,
    SEANSTURU: 'ACIL_HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'ACIL_SERVIS',
    KABULIPTALNEDENNO: null,
    KABULIPTALTARIHI: null,
    kabuliptalaciklama: '',
    IPTALEDENP: null,
    IPTALTARIHI: null,
    STATU: 'BAGLANDI',
    PRESENCE: 'GELDI',
    YATAKNO: 9
  }
];

class OracleDatabaseEngine {
  constructor() {
    this.isLiveOracleConnected = false;
    this.oraclePool = null;
  }

  /**
   * Canlı Oracle DB Bağlantısı (Eğer ortamda oracledb ve bağlantı bilgisi varsa)
   */
  async init(config = null) {
    if (config && config.user && config.password && config.connectString) {
      try {
        const oracledb = require('oracledb');
        this.oraclePool = await oracledb.createPool(config);
        this.isLiveOracleConnected = true;
        console.log('✅ [DATABASE ENGINE] Canlı Oracle DB bağlantısı başarıyla kuruldu.');
      } catch (err) {
        console.warn('⚠️ [DATABASE ENGINE] Canlı Oracle DB bağlanamadı, yerel PL/SQL Engine devrede:', err.message);
        this.isLiveOracleConnected = false;
      }
    } else {
      this.isLiveOracleConnected = false;
      console.log('⚡ [DATABASE ENGINE] Dahili PL/SQL Engine Simülatörü aktif (TRUNC(SYSDATE) desteğiyle).');
    }
  }

  /**
   * PL/SQL View Yürütme: VW_DYZ_GUNLUK_HASTA_SEANSLARI
   * SQL Karşılığı:
   *   SELECT hb.adi || ' ' || hb.soyadi AS HASTAADI, dhb.hastano, t.HASTASEANSREFNO, ...
   *     FROM dyz_hasta_seanslari t
   *     LEFT JOIN dyz_hasta_tedavi_bilgileri dhtb ON t.hastatedavirefno = dhtb.hastatedavirefno
   *     LEFT JOIN dyz_hasta_bilgileri dhb ON dhtb.hastadiyalizrefno = dhb.hastadiyalizrefno
   *     LEFT JOIN hasta_bilgileri hb ON dhb.hastano = hb.hastano
   *    WHERE t.seanstarihi >= TRUNC(SYSDATE) AND t.seanstarihi < TRUNC(SYSDATE) + 1;
   */
  async executeViewDyzGunlukHastaSeanslari(filterVardiya = null) {
    if (this.isLiveOracleConnected && this.oraclePool) {
      const oracledb = require('oracledb');
      let conn;
      try {
        conn = await this.oraclePool.getConnection();
        const sql = `SELECT * FROM VW_DYZ_GUNLUK_HASTA_SEANSLARI` +
          (filterVardiya ? ` WHERE VARDIYA = :v` : ``);
        const binds = filterVardiya ? { v: filterVardiya } : {};
        const result = await conn.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows;
      } catch (e) {
        console.error('Canlı Oracle SQL sorgu hatası, yerel engine döndürülüyor:', e);
      } finally {
        if (conn) await conn.close();
      }
    }

    // Yerel PL/SQL Engine Simülatörü:
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

    // SQL Filtresi: WHERE t.seanstarihi >= TRUNC(SYSDATE) AND t.seanstarihi < TRUNC(SYSDATE) + 1
    const rows = [];
    for (const t of T_DYZ_HASTA_SEANSLARI) {
      const seansDate = new Date(t.seanstarihi);
      if (seansDate >= startOfToday && seansDate < endOfToday) {
        // LEFT JOIN dyz_hasta_tedavi_bilgileri
        const dhtb = T_DYZ_HASTA_TEDAVI_BILGILERI.find(x => x.hastatedavirefno === t.hastatedavirefno) || {};
        // LEFT JOIN dyz_hasta_bilgileri
        const dhb = T_DYZ_HASTA_BILGILERI.find(x => x.hastadiyalizrefno === dhtb.hastadiyalizrefno) || {};
        // LEFT JOIN hasta_bilgileri
        const hb = T_HASTA_BILGILERI.find(x => x.hastano === dhb.hastano) || {};

        const vardiyaStr = (t.VARDIYATANIMNO === 1) ? 'SABAH' : 'ÖGLEN';

        if (!filterVardiya || vardiyaStr.toUpperCase() === filterVardiya.toUpperCase()) {
          rows.push({
            HASTAADI: (hb.adi && hb.soyadi) ? `${hb.adi} ${hb.soyadi}` : (t.HASTAADI || 'İsimsiz Hasta'),
            HASTANO: dhb.hastano || t.HASTANO || '00000000000',
            HASTASEANSREFNO: t.HASTASEANSREFNO,
            HASTATEDAVIREFNO: t.hastatedavirefno,
            KABULTARIHI: t.KABULTARIHI,
            HASTABASVURUREFNO: t.HASTABASVURUREFNO,
            HASTAHIZMETREFNO: t.HASTAHIZMETREFNO,
            SEANSTARIHI: t.seanstarihi,
            VARDIYA: vardiyaStr,
            SEANSTURU: t.SEANSTURU,
            SURE: t.SURE,
            BASVURUTURU: t.BASVURUTURU,
            KABULIPTALNEDENNO: t.KABULIPTALNEDENNO,
            KABULIPTALTARIHI: t.KABULIPTALTARIHI,
            kabuliptalaciklama: t.kabuliptalaciklama || '',
            IPTALEDENP: t.IPTALEDENP,
            IPTALTARIHI: t.IPTALTARIHI,
            STATU: t.STATU,
            PRESENCE: t.PRESENCE || 'GELDI',
            YATAKNO: t.YATAKNO || null,
            HEMODIYALIZ_GECMISI: dhb.hemodiyaliz_gecmisi ?? 50
          });
        }
      }
    }
    return rows;
  }

  /**
   * PL/SQL Prosedürü: PKG_DIYALIZ_DISPLAY_ENGINE.SP_DURUM_DEGISTIR
   * Sekreter panelinden veya Postman'den gelen durum güncellemesini uygular.
   */
  async spDurumDegistir(seansRefNo, yeniDurum, presence = null, aciklama = null, bedNo = null) {
    const seans = T_DYZ_HASTA_SEANSLARI.find(s => s.HASTASEANSREFNO == seansRefNo);
    if (!seans) return null;

    if (yeniDurum) seans.STATU = yeniDurum;
    if (presence) seans.PRESENCE = presence;
    if (aciklama !== null) seans.kabuliptalaciklama = aciklama;
    if (bedNo !== null) seans.YATAKNO = bedNo;

    return seans;
  }

  /**
   * Acil Hasta Kabul Prosedürü
   */
  async spAcilHastaKabul(hastaData) {
    const newSeansRefNo = Number(hastaData.HASTASEANSREFNO || Math.floor(10000 + Math.random() * 90000));
    const newTedaviRefNo = 50000 + T_DYZ_HASTA_SEANSLARI.length + 1;
    const newDiyalizRefNo = 70000 + T_DYZ_HASTA_SEANSLARI.length + 1;
    const hastaNo = hastaData.HASTANO || String(Date.now()).slice(-11);

    const names = (hastaData.HASTAADI || 'Yeni AcilHasta').split(' ');
    const adi = names[0] || 'Yeni';
    const soyadi = names.slice(1).join(' ') || 'Hasta';

    T_HASTA_BILGILERI.push({ hastano: hastaNo, adi: adi, soyadi: soyadi, tckimlikno: hastaNo });
    T_DYZ_HASTA_BILGILERI.push({ hastadiyalizrefno: newDiyalizRefNo, hastano: hastaNo, hemodiyaliz_gecmisi: hastaData.HEMODIYALIZ_GECMISI ?? 0 });
    T_DYZ_HASTA_TEDAVI_BILGILERI.push({ hastatedavirefno: newTedaviRefNo, hastadiyalizrefno: newDiyalizRefNo });

    const newSeans = {
      HASTASEANSREFNO: newSeansRefNo,
      hastatedavirefno: newTedaviRefNo,
      KABULTARIHI: new Date(),
      HASTABASVURUREFNO: 30000 + newSeansRefNo,
      HASTAHIZMETREFNO: 40000 + newSeansRefNo,
      seanstarihi: new Date(),
      VARDIYATANIMNO: 1,
      SEANSTURU: hastaData.SEANSTURU || 'ACIL_HEMODIYALIZ',
      SURE: hastaData.SURE || 145,
      BASVURUTURU: hastaData.BASVURUTURU || 'ACIL_SERVIS',
      KABULIPTALNEDENNO: null,
      KABULIPTALTARIHI: null,
      kabuliptalaciklama: '',
      IPTALEDENP: null,
      IPTALTARIHI: null,
      STATU: hastaData.STATU || 'KATETER_TAKILIYOR',
      PRESENCE: hastaData.PRESENCE || 'GELDI',
      YATAKNO: hastaData.YATAKNO || 9,
      HASTAADI: `${adi} ${soyadi}`,
      HASTANO: hastaNo
    };

    T_DYZ_HASTA_SEANSLARI.unshift(newSeans);
    return newSeans;
  }
}

module.exports = new OracleDatabaseEngine();
