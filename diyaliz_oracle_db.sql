-- ============================================================================
-- KOCAELİ ÜNİVERSİTESİ ARAŞTIRMA VE UYGULAMA HASTANESİ
-- HEMODİYALİZ ÜNİTESİ DISPLAY & ÇAĞRI ENTEGRASYON SİSTEMİ
-- NUCLEUS HBYS (HASTANE BİLGİ YÖNETİM SİSTEMİ) RESMİ VERİTABANI MİMARİSİ
-- ============================================================================
-- Tasarım Prensipleri:
-- 1. SIFIR MANUEL VERİ GİRİŞİ: Hastanın adı, TC'si, protokolü, tanıları,
--    diyaliz geçmişi (ilk seans / kateter ihtiyacı) Nucleus HBYS'den akar.
-- 2. ACİL SERVİS / RANDEVUSUZ KONSÜLTASYON ENTEGRASYONU: Acil servis veya
--    yoğun bakımdan yönlendirilen acil diyaliz hastaları protokol no / barkod ile
--    anında Nucleus'tan çekilir ve uygun yatağa atanır.
-- 3. SEKRETER YALNIZCA DURUM SEÇER: Sekreter klavyeyle hiçbir veri girmez,
--    yalnızca durum butonuna dokunur. Tüm süreler ve kurallar otomatik tetiklenir.
-- 4. KURUMSAL GÜVENLİK & DENETİM İZİ: Değiştirilemez audit loglama,
--    güvenli REST API JSON üreticisi (Display TV için bağımsız endpoint).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ESKİ NESNELERİN TEMİZLENMESİ
-- ----------------------------------------------------------------------------
BEGIN EXECUTE IMMEDIATE 'DROP VIEW VW_DIYALIZ_TV_DISPLAY'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW VW_DIYALIZ_SEKRETER_PANEL'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE DIYALIZ_SEANS_LOG CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE DIYALIZ_SEANS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE DIYALIZ_YATAKLAR CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE DIYALIZ_DURUMLAR CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE NUCLEUS_HASTA_KARTLARI CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_SEANS_ID'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_LOG_ID'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- ----------------------------------------------------------------------------
-- 2. DİZİLER (SEQUENCES)
-- ----------------------------------------------------------------------------
CREATE SEQUENCE SEQ_SEANS_ID START WITH 10001 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SEQ_LOG_ID   START WITH 1 INCREMENT BY 1 NOCACHE;

-- ----------------------------------------------------------------------------
-- 3. NUCLEUS HASTA MASTER TABLOSU (NUCLEUS HBYS SENKRONİZASYON TABLOSU)
-- Bu tabloya kesinlikle kullanıcı eliyle veri girilmez. Nucleus HBYS'nin
-- HL7 / REST API servisleri aracılığıyla veri beslenir.
-- ----------------------------------------------------------------------------
CREATE TABLE NUCLEUS_HASTA_KARTLARI (
    NUCLEUS_HASTA_ID     NUMBER(12) PRIMARY KEY,      -- Nucleus Master Patient Index (MPI)
    PROTOKOL_NO          VARCHAR2(30) NOT NULL UNIQUE, -- Günlük Başvuru / Dosya No
    TC_KIMLIK_NO         VARCHAR2(11) NOT NULL UNIQUE,
    AD                   VARCHAR2(50) NOT NULL,
    SOYAD                VARCHAR2(50) NOT NULL,
    DOGUM_TARIHI         DATE,
    KAN_GRUBU            VARCHAR2(10),
    HEMODIYALIZ_GECMISI  NUMBER(4) DEFAULT 0,          -- Daha önce aldığı seans sayısı (0 ise İlk Giriş)
    GELIS_KAYNAGI        VARCHAR2(30) DEFAULT 'POLIKLINIK' 
                         CHECK (GELIS_KAYNAGI IN ('POLIKLINIK_RUTIN', 'ACIL_SERVIS', 'YOGUN_BAKIM', 'DIGER_KLINIK')),
    RUTIN_PLAN_GRUBU     VARCHAR2(20) DEFAULT 'PZR_CRS_CUM'
                         CHECK (RUTIN_PLAN_GRUBU IN ('PZR_CRS_CUM', 'SAL_PER_CMS', 'ACIL_PLANSIZ')),
    VARSAYILAN_YATAK_NO  NUMBER(2) CHECK (VARSAYILAN_YATAK_NO BETWEEN 1 AND 9),
    NUCLEUS_GUNCELLEME   TIMESTAMP DEFAULT SYSTIMESTAMP
);

CREATE INDEX IDX_NUC_PROTOKOL ON NUCLEUS_HASTA_KARTLARI(PROTOKOL_NO);
CREATE INDEX IDX_NUC_KAYNAK ON NUCLEUS_HASTA_KARTLARI(GELIS_KAYNAGI);

-- ----------------------------------------------------------------------------
-- 4. 9 ADET DİYALİZ YATAĞI TANIMI
-- ----------------------------------------------------------------------------
CREATE TABLE DIYALIZ_YATAKLAR (
    YATAK_NO       NUMBER(2) PRIMARY KEY CHECK (YATAK_NO BETWEEN 1 AND 9),
    SALON_KODU     VARCHAR2(20) DEFAULT 'ANA_SALON',
    DURUM          VARCHAR2(20) DEFAULT 'BOS' CHECK (DURUM IN ('BOS', 'DOLU', 'DEZENFEKSIYON', 'BAKIM')),
    SON_ISLEM_TRH  TIMESTAMP DEFAULT SYSTIMESTAMP
);

BEGIN
    FOR i IN 1..9 LOOP
        INSERT INTO DIYALIZ_YATAKLAR (YATAK_NO, SALON_KODU, DURUM) VALUES (i, 'ANA_SALON', 'BOS');
    END LOOP;
    COMMIT;
END;
/

-- ----------------------------------------------------------------------------
-- 5. DURUMLAR VE KLİNİK İŞ AKIŞLARI (PARAMETRİK SÜRELER VE KONTROLLER)
-- ----------------------------------------------------------------------------
CREATE TABLE DIYALIZ_DURUMLAR (
    DURUM_KODU          VARCHAR2(30) PRIMARY KEY,
    DURUM_ADI           VARCHAR2(100) NOT NULL,
    SLAYT_GRUBU         VARCHAR2(20) NOT NULL CHECK (SLAYT_GRUBU IN ('BEKLEME', 'DIYALIZ', 'CIKIS')),
    RENK_TEMASI         VARCHAR2(30) NOT NULL,       -- CSS medikal renk sınıfı
    STANDART_SURE_DK    NUMBER(4),                   -- Kateter: 30 dk, Diyaliz: 145 dk (2sa 25dk)
    GERI_SAYIM_TETIKLE  CHAR(1) DEFAULT 'H' CHECK (GERI_SAYIM_TETIKLE IN ('E', 'H')),
    ANONS_SABLONU       VARCHAR2(250),               -- ASLA isim içermeyen sadece Yatak No şablonu
    SIRA_NO             NUMBER(2) NOT NULL
);

INSERT INTO DIYALIZ_DURUMLAR (DURUM_KODU, DURUM_ADI, SLAYT_GRUBU, RENK_TEMASI, STANDART_SURE_DK, GERI_SAYIM_TETIKLE, ANONS_SABLONU, SIRA_NO)
VALUES ('BEKLEMEDE', 'Bekleme Salonunda', 'BEKLEME', 'badge-blue', NULL, 'H', NULL, 1);

INSERT INTO DIYALIZ_DURUMLAR (DURUM_KODU, DURUM_ADI, SLAYT_GRUBU, RENK_TEMASI, STANDART_SURE_DK, GERI_SAYIM_TETIKLE, ANONS_SABLONU, SIRA_NO)
VALUES ('ODAYA_CAGRILDI', 'Hazırlık Odasına Geçiniz', 'BEKLEME', 'badge-blue', NULL, 'H', 'numaralı yatak hastamızın hazırlık odasına geçmesi rica olunur.', 2);

INSERT INTO DIYALIZ_DURUMLAR (DURUM_KODU, DURUM_ADI, SLAYT_GRUBU, RENK_TEMASI, STANDART_SURE_DK, GERI_SAYIM_TETIKLE, ANONS_SABLONU, SIRA_NO)
VALUES ('KATETER_TAKILIYOR', 'Kateter & Ön Hazırlık', 'BEKLEME', 'badge-teal', 30, 'E', NULL, 3);

INSERT INTO DIYALIZ_DURUMLAR (DURUM_KODU, DURUM_ADI, SLAYT_GRUBU, RENK_TEMASI, STANDART_SURE_DK, GERI_SAYIM_TETIKLE, ANONS_SABLONU, SIRA_NO)
VALUES ('BAGLANDI', 'Seans Devam Ediyor', 'DIYALIZ', 'badge-purple', 145, 'E', NULL, 4);

INSERT INTO DIYALIZ_DURUMLAR (DURUM_KODU, DURUM_ADI, SLAYT_GRUBU, RENK_TEMASI, STANDART_SURE_DK, GERI_SAYIM_TETIKLE, ANONS_SABLONU, SIRA_NO)
VALUES ('TEDAVI_SURUYOR', 'Seans Devam Ediyor', 'DIYALIZ', 'badge-purple', 145, 'E', NULL, 5);

INSERT INTO DIYALIZ_DURUMLAR (DURUM_KODU, DURUM_ADI, SLAYT_GRUBU, RENK_TEMASI, STANDART_SURE_DK, GERI_SAYIM_TETIKLE, ANONS_SABLONU, SIRA_NO)
VALUES ('YAKINI_CAGRILIYOR', 'Danışma Bilgilendirme', 'BEKLEME', 'badge-indigo', NULL, 'H', 'numaralı yatak hasta yakınının danışma birimine uğraması rica olunur.', 6);

INSERT INTO DIYALIZ_DURUMLAR (DURUM_KODU, DURUM_ADI, SLAYT_GRUBU, RENK_TEMASI, STANDART_SURE_DK, GERI_SAYIM_TETIKLE, ANONS_SABLONU, SIRA_NO)
VALUES ('YARIDA_KALDI', 'Hekim Kontrolünde Tamamlandı', 'BEKLEME', 'badge-soft-amber', NULL, 'H', NULL, 7);

INSERT INTO DIYALIZ_DURUMLAR (DURUM_KODU, DURUM_ADI, SLAYT_GRUBU, RENK_TEMASI, STANDART_SURE_DK, GERI_SAYIM_TETIKLE, ANONS_SABLONU, SIRA_NO)
VALUES ('AYRILDI', 'Dinlenme / Gözlem', 'CIKIS', 'badge-teal', NULL, 'H', NULL, 8);

INSERT INTO DIYALIZ_DURUMLAR (DURUM_KODU, DURUM_ADI, SLAYT_GRUBU, RENK_TEMASI, STANDART_SURE_DK, GERI_SAYIM_TETIKLE, ANONS_SABLONU, SIRA_NO)
VALUES ('TABURCU', 'İşlemler Tamamlandı', 'CIKIS', 'badge-green', NULL, 'H', NULL, 9);

-- ----------------------------------------------------------------------------
-- 6. GÜNLÜK SEANS TABLOSU
-- ----------------------------------------------------------------------------
CREATE TABLE DIYALIZ_SEANS (
    SEANS_ID            NUMBER DEFAULT SEQ_SEANS_ID.NEXTVAL PRIMARY KEY,
    NUCLEUS_HASTA_ID    NUMBER(12) NOT NULL,
    SEANS_TARIHI        DATE DEFAULT TRUNC(SYSDATE) NOT NULL,
    GELIS_TIPI          VARCHAR2(20) DEFAULT 'RUTIN' CHECK (GELIS_TIPI IN ('RUTIN', 'ACIL_SERVIS', 'KONSULTASYON')),
    YATAK_NO            NUMBER(2) CHECK (YATAK_NO BETWEEN 1 AND 9),
    DURUM_KODU          VARCHAR2(30) DEFAULT 'BEKLEMEDE' NOT NULL,
    GERI_SAYIM_BITIS    TIMESTAMP,
    BILGILENDIRME_METNI VARCHAR2(500), -- Yarıda kalma veya danışma için ekranda beliren sakin açıklama
    KATILIM_DURUMU      VARCHAR2(10) DEFAULT 'GELDI' CHECK (KATILIM_DURUMU IN ('GELDI', 'GELMEDI')), -- Sekreterin belirlediği gelme/gelmeme durumu
    GIRIS_ZAMANI        TIMESTAMP DEFAULT SYSTIMESTAMP,
    GUNCELLEME_ZAMANI   TIMESTAMP DEFAULT SYSTIMESTAMP,
    BITIS_ZAMANI        TIMESTAMP,
    KAYIT_DURUMU        CHAR(1) DEFAULT 'A' CHECK (KAYIT_DURUMU IN ('A', 'P')),
    CONSTRAINT FK_SEANS_NUC_HASTA FOREIGN KEY (NUCLEUS_HASTA_ID) REFERENCES NUCLEUS_HASTA_KARTLARI(NUCLEUS_HASTA_ID),
    CONSTRAINT FK_SEANS_YATAK FOREIGN KEY (YATAK_NO) REFERENCES DIYALIZ_YATAKLAR(YATAK_NO),
    CONSTRAINT FK_SEANS_DURUM FOREIGN KEY (DURUM_KODU) REFERENCES DIYALIZ_DURUMLAR(DURUM_KODU)
);

CREATE INDEX IDX_SEANS_TRH_YATAK ON DIYALIZ_SEANS(SEANS_TARIHI, YATAK_NO);
CREATE INDEX IDX_SEANS_AKTIF ON DIYALIZ_SEANS(KAYIT_DURUMU, DURUM_KODU);

-- ----------------------------------------------------------------------------
-- 7. AUDIT LOG TABLOSU (KİM, NE ZAMAN, HANGİ DURUMU DEĞİŞTİRDİ)
-- Hastane kalite ve akreditasyon standartları gereği her durum adımı loglanır.
-- ----------------------------------------------------------------------------
CREATE TABLE DIYALIZ_SEANS_LOG (
    LOG_ID          NUMBER DEFAULT SEQ_LOG_ID.NEXTVAL PRIMARY KEY,
    SEANS_ID        NUMBER NOT NULL,
    ESKI_DURUM      VARCHAR2(30),
    YENI_DURUM      VARCHAR2(30) NOT NULL,
    ISLEM_YAPAN     VARCHAR2(50) DEFAULT USER,
    ISLEM_ZAMANI    TIMESTAMP DEFAULT SYSTIMESTAMP,
    ACIKLAMA        VARCHAR2(500)
);

-- ============================================================================
-- 8. PL/SQL PAKETİ: PKG_DIYALIZ_DISPLAY_ENGINE
-- Nucleus API Entegrasyonu, Yatak Kilitleme, Geri Sayım ve Otomatik Süreçler
-- ============================================================================
CREATE OR REPLACE PACKAGE PKG_DIYALIZ_DISPLAY_ENGINE AS

    -- KVKK Kapsamında İsim Maskeleme (İlk harf açık, gerisi yıldız)
    FUNCTION FN_MASKELE_ISIM(p_ad IN VARCHAR2, p_soyad IN VARCHAR2) RETURN VARCHAR2;

    -- Sesli Anons Üretici: ASLA İSİM İÇERMEZ, SADECE YATAK NO
    FUNCTION FN_URET_ANONS_METNI(p_yatak_no IN NUMBER, p_durum_kodu IN VARCHAR2) RETURN VARCHAR2;

    -- Nucleus HBYS'den Günlük Rutin Hastaları Çekme / Senkronize Etme
    PROCEDURE SP_NUCLEUS_SENKRON_GUNCELLE;

    -- Acil Servisten / Yoğun Bakımdan Gelen Hastayı Anında Yatağa Kabul Etme
    -- (Yalnızca Protokol No girilir; Ad, Soyad, TC, geçmiş Nucleus'tan otomatik çekilir)
    PROCEDURE SP_ACIL_HASTA_KABUL(
        p_protokol_no  IN VARCHAR2,
        p_yatak_no     IN NUMBER,
        p_out_seans_id OUT NUMBER,
        p_out_mesaj    OUT VARCHAR2
    );

    -- Sekreter Durum Tetikleyici (Tek Tık İşlem)
    -- İlgili durumun süresini (30 dk / 145 dk) otomatik hesaplar ve yatağı günceller
    PROCEDURE SP_DURUM_DEGISTIR(
        p_seans_id         IN NUMBER,
        p_yeni_durum_kodu  IN VARCHAR2,
        p_bilgilendirme    IN VARCHAR2 DEFAULT NULL
    );

    -- Display TV için JSON Veri Üretici (Display ekranı doğrudan bu JSON'ı dinler)
    PROCEDURE SP_GET_TV_DISPLAY_JSON(p_out_json OUT CLOB);

END PKG_DIYALIZ_DISPLAY_ENGINE;
/

CREATE OR REPLACE PACKAGE BODY PKG_DIYALIZ_DISPLAY_ENGINE AS

    -- KVKK Maskeleme Fonksiyonu: Her ad ve soyadın ilk 3 harfi açık, kalanı yıldızlı
    -- Birden fazla ad veya soyad varsa (ör. Mehmet Ali Demir) her birinin ilk 3 harfi gösterilir.
    FUNCTION FN_MASKELE_ISIM(p_ad IN VARCHAR2, p_soyad IN VARCHAR2) RETURN VARCHAR2 IS
        v_full VARCHAR2(300);
        v_masked VARCHAR2(300) := '';
        v_token VARCHAR2(100);
        v_pos NUMBER := 1;
        v_len NUMBER;
    BEGIN
        v_full := TRIM(p_ad) || ' ' || TRIM(p_soyad);
        IF v_full IS NULL OR TRIM(v_full) = '' THEN
            RETURN '***';
        END IF;

        -- Boşluklara göre ad ve soyad parçalarını döngüyle maskele
        FOR i IN 1..REGEXP_COUNT(v_full, '[^ ]+') LOOP
            v_token := REGEXP_SUBSTR(v_full, '[^ ]+', 1, i);
            v_len := LENGTH(v_token);
            IF v_len <= 3 THEN
                v_masked := v_masked || v_token || '*** ';
            ELSE
                v_masked := v_masked || SUBSTR(v_token, 1, 3) || RPAD('*', v_len - 3, '*') || ' ';
            END IF;
        END LOOP;

        RETURN TRIM(v_masked);
    END FN_MASKELE_ISIM;

    -- Mahrem Güvenli Bildirim Metni (Yatak numarası belirtilmeden gizlilikle)
    FUNCTION FN_URET_ANONS_METNI(p_yatak_no IN NUMBER, p_durum_kodu IN VARCHAR2) RETURN VARCHAR2 IS
    BEGIN
        IF p_durum_kodu = 'ODAYA_CAGRILDI' THEN
            RETURN 'Lütfen dikkat. İlgili hastamızın hazırlık odasına geçmesi rica olunur.';
        ELSIF p_durum_kodu = 'YAKINI_CAGRILIYOR' THEN
            RETURN 'Lütfen dikkat. İlgili hasta yakınının danışma birimine uğraması rica olunur.';
        END IF;
        RETURN NULL;
    END FN_URET_ANONS_METNI;

    -- Nucleus Senkronizasyonu (Günün rutinine göre otomatik seans açılışı)
    PROCEDURE SP_NUCLEUS_SENKRON_GUNCELLE IS
        v_rutin_grup VARCHAR2(20);
    BEGIN
        IF TO_CHAR(SYSDATE, 'DY', 'NLS_DATE_LANGUAGE=ENGLISH') IN ('MON', 'WED', 'FRI') THEN
            v_rutin_grup := 'PZR_CRS_CUM';
        ELSE
            v_rutin_grup := 'SAL_PER_CMS';
        END IF;

        -- Nucleus'taki randevulu hastaları bugünün seans tablosuna aktar
        FOR r IN (
            SELECT h.NUCLEUS_HASTA_ID, h.VARSAYILAN_YATAK_NO, h.HEMODIYALIZ_GECMISI
            FROM NUCLEUS_HASTA_KARTLARI h
            WHERE h.RUTIN_PLAN_GRUBU = v_rutin_grup
              AND NOT EXISTS (
                  SELECT 1 FROM DIYALIZ_SEANS s 
                  WHERE s.NUCLEUS_HASTA_ID = h.NUCLEUS_HASTA_ID 
                    AND s.SEANS_TARIHI = TRUNC(SYSDATE)
              )
        ) LOOP
            INSERT INTO DIYALIZ_SEANS (
                NUCLEUS_HASTA_ID,
                SEANS_TARIHI,
                GELIS_TIPI,
                YATAK_NO,
                DURUM_KODU,
                GERI_SAYIM_BITIS
            ) VALUES (
                r.NUCLEUS_HASTA_ID,
                TRUNC(SYSDATE),
                'RUTIN',
                r.VARSAYILAN_YATAK_NO,
                'BEKLEMEDE',
                NULL
            );
        END LOOP;
        COMMIT;
    END SP_NUCLEUS_SENKRON_GUNCELLE;

    -- Acil Servis / Yoğun Bakımdan Hasta Kabulü (Sıfır Manuel Giriş)
    PROCEDURE SP_ACIL_HASTA_KABUL(
        p_protokol_no  IN VARCHAR2,
        p_yatak_no     IN NUMBER,
        p_out_seans_id OUT NUMBER,
        p_out_mesaj    OUT VARCHAR2
    ) IS
        v_hasta_id     NUMBER;
        v_gecmis       NUMBER;
        v_baslangic_durum VARCHAR2(30);
        v_sayac        NUMBER;
    BEGIN
        -- 1. Protokol Nucleus'ta mevcut mu?
        BEGIN
            SELECT NUCLEUS_HASTA_ID, HEMODIYALIZ_GECMISI
            INTO v_hasta_id, v_gecmis
            FROM NUCLEUS_HASTA_KARTLARI
            WHERE PROTOKOL_NO = p_protokol_no;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                p_out_seans_id := 0;
                p_out_mesaj := 'HATA: ' || p_protokol_no || ' nolu protokol Nucleus HBYS veritabanında bulunamadı!';
                RETURN;
        END;

        -- 2. Yatak boş mu kontrolü
        SELECT COUNT(*) INTO v_sayac
        FROM DIYALIZ_SEANS
        WHERE SEANS_TARIHI = TRUNC(SYSDATE)
          AND YATAK_NO = p_yatak_no
          AND DURUM_KODU NOT IN ('TABURCU');

        IF v_sayac > 0 THEN
            p_out_seans_id := 0;
            p_out_mesaj := 'HATA: ' || p_yatak_no || ' nolu yatak şu anda doludur. Başka bir yatak seçiniz.';
            RETURN;
        END IF;

        -- Hasta ilk defa diyalize giriyorsa otomatik KATETER_TAKILIYOR aşamasına al
        IF v_gecmis = 0 THEN
            v_baslangic_durum := 'KATETER_TAKILIYOR';
        ELSE
            v_baslangic_durum := 'BEKLEMEDE';
        END IF;

        INSERT INTO DIYALIZ_SEANS (
            NUCLEUS_HASTA_ID,
            SEANS_TARIHI,
            GELIS_TIPI,
            YATAK_NO,
            DURUM_KODU,
            GERI_SAYIM_BITIS,
            BILGILENDIRME_METNI
        ) VALUES (
            v_hasta_id,
            TRUNC(SYSDATE),
            'ACIL_SERVIS',
            p_yatak_no,
            v_baslangic_durum,
            CASE WHEN v_baslangic_durum = 'KATETER_TAKILIYOR' THEN SYSTIMESTAMP + NUMTODSINTERVAL(30, 'MINUTE') ELSE NULL END,
            'Acil Servis / Triyaj Yönlendirmesi'
        ) RETURNING SEANS_ID INTO p_out_seans_id;

        -- Yatak tablosunu DOLU olarak güncelle
        UPDATE DIYALIZ_YATAKLAR SET DURUM = 'DOLU', SON_ISLEM_TRH = SYSTIMESTAMP WHERE YATAK_NO = p_yatak_no;

        -- Log kaydı
        INSERT INTO DIYALIZ_SEANS_LOG (SEANS_ID, ESKI_DURUM, YENI_DURUM, ACIKLAMA)
        VALUES (p_out_seans_id, 'YENI_KABUL', v_baslangic_durum, 'Acil Servis Protokol: ' || p_protokol_no);

        p_out_mesaj := 'BAŞARILI: Acil hasta Nucleus verileriyle ' || p_yatak_no || ' nolu yatağa kabul edildi.';
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            p_out_seans_id := 0;
            p_out_mesaj := 'SİSTEM HATASI: ' || SQLERRM;
    END SP_ACIL_HASTA_KABUL;

    -- Sekreter Durum Değiştirme (Tek Tık)
    PROCEDURE SP_DURUM_DEGISTIR(
        p_seans_id         IN NUMBER,
        p_yeni_durum_kodu  IN VARCHAR2,
        p_bilgilendirme    IN VARCHAR2 DEFAULT NULL
    ) IS
        v_eski_durum   VARCHAR2(30);
        v_yatak_no     NUMBER;
        v_sure_dk      NUMBER;
        v_bitis_ts     TIMESTAMP := NULL;
    BEGIN
        SELECT DURUM_KODU, YATAK_NO INTO v_eski_durum, v_yatak_no
        FROM DIYALIZ_SEANS WHERE SEANS_ID = p_seans_id;

        -- Durumun standart süresi varsa hesapla (Kateter: 30 dk, Diyaliz: 145 dk)
        SELECT STANDART_SURE_DK INTO v_sure_dk
        FROM DIYALIZ_DURUMLAR WHERE DURUM_KODU = p_yeni_durum_kodu;

        IF v_sure_dk IS NOT NULL THEN
            v_bitis_ts := SYSTIMESTAMP + NUMTODSINTERVAL(v_sure_dk, 'MINUTE');
        END IF;

        -- Seans güncelle
        UPDATE DIYALIZ_SEANS
        SET DURUM_KODU = p_yeni_durum_kodu,
            GERI_SAYIM_BITIS = v_bitis_ts,
            BILGILENDIRME_METNI = NVL(p_bilgilendirme, BILGILENDIRME_METNI),
            GUNCELLEME_ZAMANI = SYSTIMESTAMP,
            BITIS_ZAMANI = CASE WHEN p_yeni_durum_kodu IN ('TABURCU', 'YARIDA_KALDI') THEN SYSTIMESTAMP ELSE BITIS_ZAMANI END
        WHERE SEANS_ID = p_seans_id;

        -- Yatak durumu güncellemesi
        IF v_yatak_no IS NOT NULL THEN
            IF p_yeni_durum_kodu IN ('BAGLANDI', 'TEDAVI_SURUYOR') THEN
                UPDATE DIYALIZ_YATAKLAR SET DURUM = 'DOLU' WHERE YATAK_NO = v_yatak_no;
            ELSIF p_yeni_durum_kodu IN ('TABURCU') THEN
                UPDATE DIYALIZ_YATAKLAR SET DURUM = 'BOS' WHERE YATAK_NO = v_yatak_no;
            END IF;
        END IF;

        -- Denetim Logu
        INSERT INTO DIYALIZ_SEANS_LOG (SEANS_ID, ESKI_DURUM, YENI_DURUM, ACIKLAMA)
        VALUES (p_seans_id, v_eski_durum, p_yeni_durum_kodu, p_bilgilendirme);

        COMMIT;
    END SP_DURUM_DEGISTIR;

    -- Display TV JSON Çıktı Servisi
    PROCEDURE SP_GET_TV_DISPLAY_JSON(p_out_json OUT CLOB) IS
    BEGIN
        SELECT JSON_OBJECT(
            'status' VALUE 'OK',
            'serverTime' VALUE TO_CHAR(SYSTIMESTAMP, 'YYYY-MM-DD"T"HH24:MI:SS'),
            'hastalar' VALUE JSON_ARRAYAGG(
                JSON_OBJECT(
                    'seansId' VALUE s.SEANS_ID,
                    'yatakNo' VALUE s.YATAK_NO,
                    'gelisTipi' VALUE s.GELIS_TIPI,
                    'maskedName' VALUE PKG_DIYALIZ_DISPLAY_ENGINE.FN_MASKELE_ISIM(h.AD, h.SOYAD),
                    'durumKodu' VALUE s.DURUM_KODU,
                    'durumAdi' VALUE d.DURUM_ADI,
                    'slaytGrubu' VALUE d.SLAYT_GRUBU,
                    'renkTemasi' VALUE d.RENK_TEMASI,
                    'kalanSaniye' VALUE CASE 
                        WHEN s.GERI_SAYIM_BITIS IS NOT NULL AND s.GERI_SAYIM_BITIS > SYSTIMESTAMP THEN
                            ROUND(EXTRACT(DAY FROM (s.GERI_SAYIM_BITIS - SYSTIMESTAMP)) * 86400 +
                                  EXTRACT(HOUR FROM (s.GERI_SAYIM_BITIS - SYSTIMESTAMP)) * 3600 +
                                  EXTRACT(MINUTE FROM (s.GERI_SAYIM_BITIS - SYSTIMESTAMP)) * 60 +
                                  EXTRACT(SECOND FROM (s.GERI_SAYIM_BITIS - SYSTIMESTAMP)))
                        ELSE 0 END,
                    'bilgilendirme' VALUE s.BILGILENDIRME_METNI,
                    'anonsMetni' VALUE PKG_DIYALIZ_DISPLAY_ENGINE.FN_URET_ANONS_METNI(s.YATAK_NO, s.DURUM_KODU)
                ) ORDER BY s.YATAK_NO ASC NULLS LAST
            )
        )
        INTO p_out_json
        FROM DIYALIZ_SEANS s
        JOIN NUCLEUS_HASTA_KARTLARI h ON s.NUCLEUS_HASTA_ID = h.NUCLEUS_HASTA_ID
        JOIN DIYALIZ_DURUMLAR d ON s.DURUM_KODU = d.DURUM_KODU
        WHERE s.SEANS_TARIHI = TRUNC(SYSDATE)
          AND s.KAYIT_DURUMU = 'A';
    END SP_GET_TV_DISPLAY_JSON;

END PKG_DIYALIZ_DISPLAY_ENGINE;
/

-- ============================================================================
-- 9. GÖRÜNÜMLER (VIEWS)
-- ============================================================================

-- Display TV Görünümü (Salondaki TV ekranının direkt bağlandığı görünüm)
CREATE OR REPLACE VIEW VW_DIYALIZ_TV_DISPLAY AS
SELECT 
    s.SEANS_ID,
    s.YATAK_NO,
    s.GELIS_TIPI,
    PKG_DIYALIZ_DISPLAY_ENGINE.FN_MASKELE_ISIM(h.AD, h.SOYAD) AS MASKELI_ISIM,
    s.DURUM_KODU,
    d.DURUM_ADI,
    d.SLAYT_GRUBU,
    d.RENK_TEMASI,
    d.STANDART_SURE_DK,
    s.GERI_SAYIM_BITIS,
    s.BILGILENDIRME_METNI,
    PKG_DIYALIZ_DISPLAY_ENGINE.FN_URET_ANONS_METNI(s.YATAK_NO, s.DURUM_KODU) AS GUVENLI_ANONS_METNI
FROM DIYALIZ_SEANS s
JOIN NUCLEUS_HASTA_KARTLARI h ON s.NUCLEUS_HASTA_ID = h.NUCLEUS_HASTA_ID
JOIN DIYALIZ_DURUMLAR d ON s.DURUM_KODU = d.DURUM_KODU
WHERE s.SEANS_TARIHI = TRUNC(SYSDATE)
  AND s.KAYIT_DURUMU = 'A'
  AND s.KATILIM_DURUMU = 'GELDI';

-- Sekreter Yönetim Görünümü (Tüm kimlik ve klinik detayları içerir)
CREATE OR REPLACE VIEW VW_DIYALIZ_SEKRETER_PANEL AS
SELECT 
    s.SEANS_ID,
    h.PROTOKOL_NO,
    h.TC_KIMLIK_NO,
    h.AD || ' ' || h.SOYAD AS HASTA_AD_SOYAD,
    PKG_DIYALIZ_DISPLAY_ENGINE.FN_MASKELE_ISIM(h.AD, h.SOYAD) AS MASKELI_ISIM,
    h.GELIS_KAYNAGI,
    s.GELIS_TIPI,
    h.RUTIN_PLAN_GRUBU,
    h.HEMODIYALIZ_GECMISI,
    CASE WHEN h.HEMODIYALIZ_GECMISI = 0 THEN 'EVET (KATETER GEREKLİ)' ELSE 'HAYIR (RUTİN SEANS)' END AS ILK_GIRIS_MI,
    s.YATAK_NO,
    s.DURUM_KODU,
    d.DURUM_ADI,
    d.STANDART_SURE_DK,
    s.GERI_SAYIM_BITIS,
    s.BILGILENDIRME_METNI,
    TO_CHAR(s.GIRIS_ZAMANI, 'HH24:MI') AS GIRIS_SAATI,
    TO_CHAR(s.GUNCELLEME_ZAMANI, 'HH24:MI') AS SON_ISLEM_SAATI
FROM DIYALIZ_SEANS s
JOIN NUCLEUS_HASTA_KARTLARI h ON s.NUCLEUS_HASTA_ID = h.NUCLEUS_HASTA_ID
JOIN DIYALIZ_DURUMLAR d ON s.DURUM_KODU = d.DURUM_KODU
WHERE s.SEANS_TARIHI = TRUNC(SYSDATE)
  AND s.KAYIT_DURUMU = 'A';

-- ============================================================================
-- 10. NUCLEUS HBYS TEST VERİ HAVUZU (CANLI HASTANE SENARYOSU)
-- ============================================================================

-- Pazartesi - Çarşamba - Cuma Rutin Hastaları (Nucleus Master Data)
INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90001, 'PRT-2024-001', '10000000001', 'Ahmet', 'Yıldız', 142, 'POLIKLINIK_RUTIN', 'PZR_CRS_CUM', 1);

INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90002, 'PRT-2024-002', '10000000002', 'Mehmet', 'Demir', 0, 'POLIKLINIK_RUTIN', 'PZR_CRS_CUM', 2); -- İLK GİRİŞ (0 SEANS)

INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90003, 'PRT-2024-003', '10000000003', 'Ayşe', 'Korkmaz', 88, 'POLIKLINIK_RUTIN', 'PZR_CRS_CUM', 3);

INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90004, 'PRT-2024-004', '10000000004', 'Fatma', 'Çelik', 215, 'POLIKLINIK_RUTIN', 'PZR_CRS_CUM', 4);

INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90005, 'PRT-2024-005', '10000000005', 'Ali', 'Kaya', 64, 'POLIKLINIK_RUTIN', 'PZR_CRS_CUM', 5);

INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90006, 'PRT-2024-006', '10000000006', 'Hatice', 'Öztürk', 120, 'POLIKLINIK_RUTIN', 'PZR_CRS_CUM', 6);

INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90007, 'PRT-2024-007', '10000000007', 'Hüseyin', 'Arslan', 95, 'POLIKLINIK_RUTIN', 'PZR_CRS_CUM', 7);

INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90008, 'PRT-2024-008', '10000000008', 'Emine', 'Koç', 180, 'POLIKLINIK_RUTIN', 'PZR_CRS_CUM', 8);

-- Acil Servis / Yoğun Bakım Hastaları (Randevusuz ama Nucleus'ta Protokolü Olan)
INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90009, 'PRT-ACIL-991', '10000000009', 'Mustafa', 'Aydın', 12, 'ACIL_SERVIS', 'ACIL_PLANSIZ', 9);

INSERT INTO NUCLEUS_HASTA_KARTLARI (NUCLEUS_HASTA_ID, PROTOKOL_NO, TC_KIMLIK_NO, AD, SOYAD, HEMODIYALIZ_GECMISI, GELIS_KAYNAGI, RUTIN_PLAN_GRUBU, VARSAYILAN_YATAK_NO)
VALUES (90010, 'PRT-ACIL-992', '10000000010', 'Kemal', 'Yılmaz', 0, 'ACIL_SERVIS', 'ACIL_PLANSIZ', NULL);

-- Günün senkronizasyonunu otomatik başlat
EXEC PKG_DIYALIZ_DISPLAY_ENGINE.SP_NUCLEUS_SENKRON_GUNCELLE;

-- Seans örnek durumlarını güncelle (Geri sayımlar ile)
-- 2 Nolu Yatak: Mehmet Demir (İlk giriş - 30 dk kateter süreci)
EXEC PKG_DIYALIZ_DISPLAY_ENGINE.SP_DURUM_DEGISTIR(10002, 'KATETER_TAKILIYOR');

-- 4 Nolu Yatak: Fatma Çelik (Diyalize bağlandı - 145 dk seans)
EXEC PKG_DIYALIZ_DISPLAY_ENGINE.SP_DURUM_DEGISTIR(10004, 'BAGLANDI');

-- 5 Nolu Yatak: Ali Kaya (Hekim kontrolünde seans tamamlandı)
EXEC PKG_DIYALIZ_DISPLAY_ENGINE.SP_DURUM_DEGISTIR(10005, 'YARIDA_KALDI', 'Tansiyon dengelenmesi amacıyla hekim kararıyla seans erken tamamlanmış olup dinlenme odasında istirahat etmektedir.');

-- 9 Nolu Yatak: Acil Servisten Kabul Edildi
EXEC PKG_DIYALIZ_DISPLAY_ENGINE.SP_DURUM_DEGISTIR(10009, 'BAGLANDI');

-- ============================================================================
-- 11. GÜNLÜK OTOMATİK SEANS VE HASTA ÇEKME SORGUSU (TRUNC(SYSDATE) İLE DİNAMİK)
-- ============================================================================
-- Bu sorgu doğrudan Nucleus / Diyaliz seans tablolarından bugünün seanslarını
-- 00:00:00 ile 23:59:59 arasında otomatik çeker.
-- ============================================================================
CREATE OR REPLACE VIEW VW_DYZ_GUNLUK_HASTA_SEANSLARI AS
SELECT hb.adi || ' ' || hb.soyadi AS HASTAADI,
       dhb.hastano,
       t.HASTASEANSREFNO,
       t.HASTATEDAVIREFNO,
       t.KABULTARIHI,
       t.HASTABASVURUREFNO,
       t.HASTAHIZMETREFNO,
       t.SEANSTARIHI,
       CASE WHEN t.VARDIYATANIMNO = 1 THEN 'SABAH' ELSE 'ÖGLEN' END AS VARDIYA,
       t.SEANSTURU,
       t.SURE,
       t.BASVURUTURU,
       t.KABULIPTALNEDENNO,
       t.KABULIPTALTARIHI,
       t.kabuliptalaciklama,
       t.IPTALEDENP,
       t.IPTALTARIHI,
       t.STATU
  FROM dyz_hasta_seanslari t
  LEFT JOIN dyz_hasta_tedavi_bilgileri dhtb
    ON t.hastatedavirefno = dhtb.hastatedavirefno
  LEFT JOIN dyz_hasta_bilgileri dhb
    ON dhtb.hastadiyalizrefno = dhb.hastadiyalizrefno
  LEFT JOIN hasta_bilgileri hb 
    ON dhb.hastano = hb.hastano
 WHERE t.seanstarihi >= TRUNC(SYSDATE) 
   AND t.seanstarihi <  TRUNC(SYSDATE) + 1;

COMMIT;
