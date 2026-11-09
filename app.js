// ============================================================================
// NUCLEUS HBYS ENTEGRASYONLU DİYALİZ DISPLAY & SEKRETER YÖNETİM MOTORU
// - YALNIZCA KISA, ZARİF VE HUZURLU BİR DİNG BİLDİRİM ZİLİ (CHIME)
// - PAZARTESİ-ÇARŞAMBA-CUMA (8 HASTA) VE SALI-PERŞEMBE-CUMARTESİ (9 HASTA) TAKVİM MOTORU
// - TAHMİNİ SEANS BİTİŞ SAATİ HESAPLAMA VE GÖSTERİMİ
// - VERİTABANI İLE TAM SENKRON HASTA EKLEME & HASTA SİLME YETKİSİ
// ============================================================================

// ============================================================================
// FARKLI CİHAZLAR VE OTOMATİK IP ÇÖZÜMLEME (FLASK & LAN UYUMLU)
// Cihaz veya modem IP'si değiştiğinde hiçbir manuel ayar gerektirmez!
// ============================================================================
function resolveApiUrl(path) {
  // Eğer tarayıcıda HTTP/HTTPS üzerinden çalışıyorsa (localhost, yerel LAN IP veya bilgisayar adı)
  // her zaman o anki sunucu kök dizinini (origin) kullan. Böylece IP değişse bile otomatik çalışır!
  if (typeof window !== 'undefined' && window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
    return path;
  }
  // file:// protokolüyle doğrudan dosyadan açıldıysa varsayılan yerel port
  return 'http://localhost:5000' + path;
}

// Veritabanında Tutulan Tek Gerçek Hasta Listesi (Toplam 17 Hasta: 8 Pzt-Çar-Cum + 9 Sal-Per-Cmt)
const DEFAULT_ORACLE_RAW_DATABASE = [
  // ==========================================================================
  // 1. GRUP: PAZARTESİ - ÇARŞAMBA - CUMA GELEN HASTALAR (8 HASTA)
  // ==========================================================================
  {
    HASTAADI: 'RIZA HALUK TOYGARLI',
    HASTANO: '6736616',
    HASTASEANSREFNO: 10001,
    HASTATEDAVIREFNO: 50001,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30001,
    HASTAHIZMETREFNO: 40001,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'PLANLANDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'PZT_CAR_CUM',
    STATU: 'BEKLEMEDE',
    YATAKNO: 1,
    HEMODIYALIZ_GECMISI: 142
  },
  {
    HASTAADI: 'AYNUR SAĞLAM',
    HASTANO: '6532204',
    HASTASEANSREFNO: 10002,
    HASTATEDAVIREFNO: 50002,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30002,
    HASTAHIZMETREFNO: 40002,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'PLANLANDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'PZT_CAR_CUM',
    STATU: 'BEKLEMEDE',
    YATAKNO: 2,
    HEMODIYALIZ_GECMISI: 96
  },
  {
    HASTAADI: 'İSMAİL GÖKCE',
    HASTANO: '6393894',
    HASTASEANSREFNO: 10003,
    HASTATEDAVIREFNO: 50003,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30003,
    HASTAHIZMETREFNO: 40003,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'PLANLANDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'PZT_CAR_CUM',
    STATU: 'BEKLEMEDE',
    YATAKNO: 3,
    HEMODIYALIZ_GECMISI: 88
  },
  {
    HASTAADI: 'ZEKİYE AKYOL',
    HASTANO: '6040445',
    HASTASEANSREFNO: 10004,
    HASTATEDAVIREFNO: 50004,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30004,
    HASTAHIZMETREFNO: 40004,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'PLANLANDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'PZT_CAR_CUM',
    STATU: 'BEKLEMEDE',
    YATAKNO: 4,
    HEMODIYALIZ_GECMISI: 215
  },
  {
    HASTAADI: 'ŞAZİMET TOKGÖZ',
    HASTANO: '1197043',
    HASTASEANSREFNO: 10005,
    HASTATEDAVIREFNO: 50005,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30005,
    HASTAHIZMETREFNO: 40005,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'PLANLANDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'PZT_CAR_CUM',
    STATU: 'BEKLEMEDE',
    YATAKNO: 5,
    HEMODIYALIZ_GECMISI: 64
  },
  {
    HASTAADI: 'SEVİLAY ORDUKAYA',
    HASTANO: '508095',
    HASTASEANSREFNO: 10006,
    HASTATEDAVIREFNO: 50006,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30006,
    HASTAHIZMETREFNO: 40006,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'PLANLANDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'PZT_CAR_CUM',
    STATU: 'BEKLEMEDE',
    YATAKNO: 6,
    HEMODIYALIZ_GECMISI: 120
  },
  {
    HASTAADI: 'CENGİZ PEKCAN',
    HASTANO: '312299',
    HASTASEANSREFNO: 10007,
    HASTATEDAVIREFNO: 50007,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30007,
    HASTAHIZMETREFNO: 40007,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'PLANLANDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'PZT_CAR_CUM',
    STATU: 'BEKLEMEDE',
    YATAKNO: 7,
    HEMODIYALIZ_GECMISI: 95
  },
  {
    HASTAADI: 'SEBAHATTİN ÖZTÜRK',
    HASTANO: '29684',
    HASTASEANSREFNO: 10008,
    HASTATEDAVIREFNO: 50008,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30008,
    HASTAHIZMETREFNO: 40008,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'PLANLANDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'PZT_CAR_CUM',
    STATU: 'BEKLEMEDE',
    YATAKNO: 8,
    HEMODIYALIZ_GECMISI: 180
  },

  // ==========================================================================
  // 2. GRUP: SALI - PERŞEMBE - CUMARTESİ GELEN HASTALAR (9 HASTA)
  // ==========================================================================
  {
    HASTAADI: 'FATİH IŞIK',
    HASTANO: '6149044',
    HASTASEANSREFNO: 10009,
    HASTATEDAVIREFNO: 50009,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30009,
    HASTAHIZMETREFNO: 40009,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'KABUL_EDILDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'SAL_PER_CMT',
    STATU: 'BEKLEMEDE',
    YATAKNO: 1,
    HEMODIYALIZ_GECMISI: 110
  },
  {
    HASTAADI: 'DURSUN ÖNAL',
    HASTANO: '1188734',
    HASTASEANSREFNO: 10010,
    HASTATEDAVIREFNO: 50010,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30010,
    HASTAHIZMETREFNO: 40010,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'KABUL_EDILDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'SAL_PER_CMT',
    STATU: 'BEKLEMEDE',
    YATAKNO: 2,
    HEMODIYALIZ_GECMISI: 134
  },
  {
    HASTAADI: 'HAVA HIDIR',
    HASTANO: '1179170',
    HASTASEANSREFNO: 10011,
    HASTATEDAVIREFNO: 50011,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30011,
    HASTAHIZMETREFNO: 40011,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'KABUL_EDILDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'SAL_PER_CMT',
    STATU: 'BEKLEMEDE',
    YATAKNO: 3,
    HEMODIYALIZ_GECMISI: 82
  },
  {
    HASTAADI: 'MEHMET HENİFİ ÖZTEKİN',
    HASTANO: '606245',
    HASTASEANSREFNO: 10012,
    HASTATEDAVIREFNO: 50012,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30012,
    HASTAHIZMETREFNO: 40012,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'KABUL_EDILDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'SAL_PER_CMT',
    STATU: 'BEKLEMEDE',
    YATAKNO: 4,
    HEMODIYALIZ_GECMISI: 156
  },
  {
    HASTAADI: 'EKREM YILDIZ',
    HASTANO: '533598',
    HASTASEANSREFNO: 10013,
    HASTATEDAVIREFNO: 50013,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30013,
    HASTAHIZMETREFNO: 40013,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'KABUL_EDILDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'SAL_PER_CMT',
    STATU: 'BEKLEMEDE',
    YATAKNO: 5,
    HEMODIYALIZ_GECMISI: 92
  },
  {
    HASTAADI: 'MUSTAFA KIYAK',
    HASTANO: '266944',
    HASTASEANSREFNO: 10014,
    HASTATEDAVIREFNO: 50014,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30014,
    HASTAHIZMETREFNO: 40014,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'KABUL_EDILDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'SAL_PER_CMT',
    STATU: 'BEKLEMEDE',
    YATAKNO: 6,
    HEMODIYALIZ_GECMISI: 148
  },
  {
    HASTAADI: 'BAHİNAR GÖKMEN',
    HASTANO: '178990',
    HASTASEANSREFNO: 10015,
    HASTATEDAVIREFNO: 50015,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30015,
    HASTAHIZMETREFNO: 40015,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'KABUL_EDILDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'SAL_PER_CMT',
    STATU: 'BEKLEMEDE',
    YATAKNO: 7,
    HEMODIYALIZ_GECMISI: 105
  },
  {
    HASTAADI: 'SEVİM ZEYLAN',
    HASTANO: '141594',
    HASTASEANSREFNO: 10016,
    HASTATEDAVIREFNO: 50016,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30016,
    HASTAHIZMETREFNO: 40016,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'KABUL_EDILDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'SAL_PER_CMT',
    STATU: 'BEKLEMEDE',
    YATAKNO: 8,
    HEMODIYALIZ_GECMISI: 164
  },
  {
    HASTAADI: 'ZEKİ YILDIZ',
    HASTANO: '117389',
    HASTASEANSREFNO: 10017,
    HASTATEDAVIREFNO: 50017,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30017,
    HASTAHIZMETREFNO: 40017,
    SEANSTARIHI: new Date(),
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 180,
    BASVURUTURU: 'KABUL_EDILDI',
    MERKEZ: 'Erişkin',
    GUN_GRUBU: 'SAL_PER_CMT',
    STATU: 'BEKLEMEDE',
    YATAKNO: 9,
    HEMODIYALIZ_GECMISI: 190
  }
];

// Kalıcı Hasta Veritabanı Havuzu (Yıllarca Kullanım İçin localStorage Üzerinde Saklanır)
const MASTER_ROSTER_STORAGE_KEY = 'diyaliz_master_hasta_listesi_v3';
const STANDART_DIYALIZ_SURESI_DK = 180; // Her hasta için standart diyalize bağlama süresi: 3 Saat (180 dk)

function extractIsoDateFromTimestamp(tsOrDate) {
  const d = tsOrDate ? new Date(tsOrDate) : new Date();
  if (isNaN(d.getTime())) return getTodayIsoString();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function loadMasterRoster() {
  try {
    const saved = localStorage.getItem(MASTER_ROSTER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Eski 145 dk veya 30 dk gibi süreleri standart 3 saat (180 dk) olarak güncelle
        // Ayrıca sonradan eklenen yeni hastalarda KAYIT_TARIHI yoksa eklendiği tarihi ata (geçmiş tarihlerde görünmemesi için)
        return parsed.map(r => {
          const isNewlyAddedPatient = Number(r.HASTASEANSREFNO) > 1000000000000;
          const kayitTarihi = r.KAYIT_TARIHI || (isNewlyAddedPatient ? extractIsoDateFromTimestamp(Number(r.HASTASEANSREFNO)) : null);
          const rawNoDigits = String(r.HASTANO || '').replace(/[^0-9]/g, '');
          const normalizedNo = rawNoDigits === '029684'
            ? '29684'
            : (rawNoDigits.length > 8 ? rawNoDigits.slice(0, 8) : rawNoDigits);

          let cleanName = String(r.HASTAADI || '').trim();
          if (Number(r.HASTASEANSREFNO) === 10005 && (cleanName.includes('gjgj') || cleanName.includes('fsafs'))) {
            cleanName = 'ŞAZİMET TOKGÖZ';
          } else if (Number(r.HASTASEANSREFNO) === 10007 && (cleanName === 'CENG PEKCAN' || cleanName.includes('kjh') || cleanName.includes('asdf') || cleanName.includes('hgg'))) {
            cleanName = 'CENGİZ PEKCAN';
          } else if (Number(r.HASTASEANSREFNO) === 10010 && cleanName.includes('kkk')) {
            cleanName = 'DURSUN ÖNAL';
          }

          // Her gün seçildiği halde acil gibi BUGUN atanmış rutin hastaları otomatik onar
          let fixedGunGrubu = r.GUN_GRUBU;
          if (r.BASVURUTURU !== 'ACIL_SERVIS') {
            if (Array.isArray(r.OZEL_GUNLER) && r.OZEL_GUNLER.length === 6) {
              fixedGunGrubu = 'HER_GUN';
            } else if (r.GUN_GRUBU === 'BUGUN' && Array.isArray(r.OZEL_GUNLER) && r.OZEL_GUNLER.length > 0) {
              fixedGunGrubu = r.OZEL_GUNLER.length === 6 ? 'HER_GUN' : r.OZEL_GUNLER.join('_');
            }
          }

          const rawSure = Number(r.SURE);
          const sureVal = (rawSure && rawSure >= 60 && rawSure !== 145) ? rawSure : STANDART_DIYALIZ_SURESI_DK;

          return {
            ...r,
            HASTAADI: cleanName || r.HASTAADI,
            HASTANO: normalizedNo || r.HASTANO,
            GUN_GRUBU: fixedGunGrubu,
            KAYIT_TARIHI: kayitTarihi,
            SURE: sureVal
          };
        });
      }
    }
  } catch (e) {
    console.warn('Kalıcı hasta listesi okunamadı:', e);
  }
  const initial = DEFAULT_ORACLE_RAW_DATABASE.map(r => ({ ...r, SURE: STANDART_DIYALIZ_SURESI_DK }));
  saveMasterRoster(initial);
  return initial;
}

function saveMasterRoster(roster) {
  try {
    localStorage.setItem(MASTER_ROSTER_STORAGE_KEY, JSON.stringify(roster));
  } catch (e) {
    console.warn('Kalıcı hasta listesi kaydedilemedi:', e);
  }
  // Ekranda yapılan her değişikliği anında diske (diyaliz_database.json ve diyaliz_oracle_db.sql) yaz
  const targetUrl = resolveApiUrl('/api/seanslar');
  fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ ACTION: 'SYNC_ROSTER', roster })
  }).catch(() => { });
}

let ORACLE_RAW_DATABASE = loadMasterRoster();

// KVKK İsim Maskeleme (Her ad ve soyadın ilk 3 harfi açık, kalanı *; 3 harften kısaysa tamamı gösterilir)
// Örn: 'Ahmet Yıldız' -> 'Ahm*** Yıl***', 'Mehmet Ali Demir' -> 'Meh*** Ali*** Dem***'
function maskFullName(fullName) {
  if (!fullName) return '***';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.map(p => {
    if (p.length <= 3) {
      return p + '***';
    }
    return p.substring(0, 3) + '*'.repeat(p.length - 3);
  }).join(' ');
}

// Oracle SQL satırlarını Ekran Nesnelerine Dönüştüren Çevirici Fonksiyon
function mapOracleRowToActiveSeans(row) {
  const parts = (row.HASTAADI || 'Hasta İsimsiz').split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  const isFirst = (row.HEMODIYALIZ_GECMISI === 0);
  const status = row.STATU || 'BEKLEMEDE';

  let statusText = 'Bekleme Salonunda';
  let badgeClass = 'badge-blue';
  let slideGroup = 'BEKLEME';
  let instruction = '';
  let countdownEndsAt = row.COUNTDOWN_ENDS_AT ? new Date(row.COUNTDOWN_ENDS_AT) : null;
  let countdownType = null;
  let isUrgentCall = (status === 'ODAYA_CAGRILDI');
  let isFamilyCall = (status === 'YAKINI_CAGRILIYOR');
  let isAborted = (status === 'YARIDA_KALDI');

  const plannedDuration = (Number(row.SURE) && Number(row.SURE) >= 60) ? Number(row.SURE) : STANDART_DIYALIZ_SURESI_DK;

  if (status === 'ODAYA_CAGRILDI') {
    statusText = 'Hazırlık Odasına Geçiniz';
    badgeClass = 'badge-blue';
    slideGroup = 'BEKLEME';
    instruction = 'Lütfen Diyaliz Hazırlık Odasına Geçiniz.';
    if (!countdownEndsAt || countdownEndsAt.getTime() <= Date.now()) {
      countdownEndsAt = new Date(Date.now() + 3 * 60 * 1000);
    }
    countdownType = 'HAZIRLIK';
  } else if (status === 'KATETER_TAKILIYOR') {
    statusText = 'Kateter Hazırlığı (30 dk)';
    badgeClass = 'badge-teal';
    slideGroup = 'BEKLEME';
    instruction = '';
    if (!countdownEndsAt || countdownEndsAt.getTime() <= Date.now()) {
      countdownEndsAt = new Date(Date.now() + 30 * 60 * 1000);
    }
    countdownType = 'KATETER';
  } else if (status === 'BAGLANDI' || status === 'TEDAVI_SURUYOR') {
    statusText = 'Seans Devam Ediyor';
    badgeClass = 'badge-purple';
    slideGroup = 'DIYALIZ';
    instruction = '';
    if (!countdownEndsAt || countdownEndsAt.getTime() <= Date.now()) {
      countdownEndsAt = new Date(Date.now() + plannedDuration * 60 * 1000);
    }
    countdownType = 'DIYALIZ';
  } else if (status === 'YAKINI_CAGRILIYOR') {
    statusText = '🔔 Hasta Yakını Çağrısı (Danışma)';
    badgeClass = 'badge-family-call';
    slideGroup = 'BEKLEME';
    instruction = 'Hasta Yakınının Danışmaya Uğraması Rica Olunur.';
  } else if (status === 'YARIDA_KALDI') {
    statusText = 'Hekim Kararıyla Erken Durdurma';
    badgeClass = 'badge-soft-amber';
    slideGroup = 'CIKIS';
    instruction = '';
    countdownEndsAt = null;
  } else if (status === 'AYRILDI') {
    statusText = 'Dinlenme / Gözlem';
    badgeClass = 'badge-teal';
    slideGroup = 'CIKIS';
    instruction = '';
    if (!countdownEndsAt || countdownEndsAt.getTime() <= Date.now()) {
      countdownEndsAt = new Date(Date.now() + 15 * 60 * 1000);
    }
    countdownType = 'DINLENME';
  } else if (status === 'TABURCU') {
    statusText = 'Seans Tamamlandı';
    badgeClass = 'badge-green';
    slideGroup = 'CIKIS';
    instruction = '';
    countdownEndsAt = null;
  }

  return {
    seansId: row.HASTASEANSREFNO || Date.now(),
    protokolNo: `PRT-2026-${String(row.HASTASEANSREFNO || 0).slice(-4)}`,
    tcNo: row.HASTANO || '10000000000',
    firstName: firstName,
    lastName: lastName,
    maskedName: maskFullName(row.HASTAADI),
    dialysisHistory: row.HEMODIYALIZ_GECMISI ?? 50,
    isFirstDialysis: isFirst,
    bedNo: row.YATAKNO || null,
    gelisTipi: row.BASVURUTURU || 'PLANLANDI',
    merkez: row.MERKEZ || 'Erişkin',
    gunGrubu: row.GUN_GRUBU || 'PZT_CAR_CUM',
    ozelGunler: Array.isArray(row.OZEL_GUNLER) ? row.OZEL_GUNLER : null,
    plannedDurationMinutes: plannedDuration,
    status: status,
    statusText: statusText,
    badgeClass: badgeClass,
    slideGroup: slideGroup,
    instruction: instruction,
    countdownEndsAt: countdownEndsAt,
    countdownType: countdownType,
    isUrgentCall: isUrgentCall,
    isFamilyCall: isFamilyCall,
    isAborted: isAborted,
    vardiya: row.VARDIYA || 'SABAH',
    updatedAt: new Date()
  };
}

// Aktif Seans Listesi (Veritabanından veya Senkronize Durumdan otomatik yüklenir)
let activeSeansList = [];

// ============================================================================
// EKRANLAR ARASI CANLI SENKRONİZASYON MOTORU
// (Sekreter Ekranı -> TV Bekleme Ekranı Anlık Yansıma)
// BroadcastChannel + localStorage + REST API (/api/sync-state)
// ============================================================================
const SYNC_STORAGE_KEY = 'diyaliz_shared_seans_state_v3';
const INSTANCE_ID = 'inst_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
let lastAppliedSyncTimestamp = 0;

// ============================================================================
// YILLARCA KULLANILABİLİR OTOMATİK TAKVİM & ESNEK GÜN SEÇİM MOTORU
// ============================================================================
const DAY_SHORT_NAMES = {
  PZT: 'Pzt',
  SAL: 'Sal',
  CAR: 'Çar',
  PER: 'Per',
  CUM: 'Cum',
  CMT: 'Cmt'
};

function getPatientDaysArray(gunGrubu, ozelGunler = null) {
  const code = String(gunGrubu || 'PZT_CAR_CUM').toUpperCase();
  if (code === 'BUGUN') {
    return [];
  }
  if (code === 'HER_GUN') {
    return ['PZT', 'SAL', 'CAR', 'PER', 'CUM', 'CMT'];
  }
  if (Array.isArray(ozelGunler) && ozelGunler.length > 0) {
    return ozelGunler;
  }
  if (code === 'PZT_CAR_CUM') return ['PZT', 'CAR', 'CUM'];
  if (code === 'SAL_PER_CMT') return ['SAL', 'PER', 'CMT'];
  if (code === 'PZT_CAR_CMT') return ['PZT', 'CAR', 'CMT'];
  if (code === 'PZT_CAR_PER') return ['PZT', 'CAR', 'PER'];
  // Özel format (Örn: "PZT_CAR_CMT" veya "SAL_CUMA")
  const validDays = ['PZT', 'SAL', 'CAR', 'PER', 'CUM', 'CMT'];
  const parts = code.split('_').filter(d => validDays.includes(d));
  return parts.length > 0 ? parts : ['PZT', 'CAR', 'CUM'];
}

function formatDayGroupShort(gunGrubu, ozelGunler = null, isEmergency = false) {
  if (isEmergency || gunGrubu === 'BUGUN') return 'Bugün';
  if (gunGrubu === 'HER_GUN') return 'Her Gün';
  const days = getPatientDaysArray(gunGrubu, ozelGunler);
  if (days.length === 6) return 'Her Gün';
  if (days.length === 0) return 'Bugün';
  return days.map(d => DAY_SHORT_NAMES[d] || d).join(' - ');
}

function getWeekdayCodeFromIsoDate(isoDateStr) {
  const d = isoDateStr ? new Date(isoDateStr + 'T12:00:00') : new Date();
  const day = d.getDay(); // 0=Pazar, 1=Pzt, 2=Sal, 3=Çar, 4=Per, 5=Cum, 6=Cmt
  const map = ['PAZ', 'PZT', 'SAL', 'CAR', 'PER', 'CUM', 'CMT'];
  return map[day] || 'PZT';
}

function getTodayIsoString() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatDateTR(isoDateStr) {
  if (!isoDateStr) return '-';
  const parts = isoDateStr.split('-');
  if (parts.length !== 3) return isoDateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getWeekdayFullNameTR(isoDateStr) {
  const code = getWeekdayCodeFromIsoDate(isoDateStr);
  const fullNames = {
    PZT: 'Pazartesi',
    SAL: 'Salı',
    CAR: 'Çarşamba',
    PER: 'Perşembe',
    CUM: 'Cuma',
    CMT: 'Cumartesi',
    PAZ: 'Pazar'
  };
  return fullNames[code] || code;
}

function getDayGroupFromIsoDate(isoDateStr) {
  const d = isoDateStr ? new Date(isoDateStr + 'T12:00:00') : new Date();
  const day = d.getDay(); // 0=Pazar, 1=Pzt, 2=Sal, 3=Çar, 4=Per, 5=Cum, 6=Cmt
  if (day === 1 || day === 3 || day === 5) return 'PZT_CAR_CUM';
  if (day === 2 || day === 4 || day === 6) return 'SAL_PER_CMT';
  return 'PZT_CAR_CUM';
}

function getDayGroupLabel(groupCode) {
  return `${getWeekdayFullNameTR(currentSelectedDateIso)} Seans Listesi`;
}

function doesRowMatchSelectedFilter(row) {
  // Sekreter bu hastayı sadece seçili tarih için listeden gizlediyse gösterme
  if (row.MANUEL_HARIC_TARIH === currentSelectedDateIso) return false;

  // Acilden gelen hastalar sadece 1 kerelik ("Bugün") gelir
  if (row.BASVURUTURU === 'ACIL_SERVIS' || row.GUN_GRUBU === 'BUGUN') {
    const acilDate = row.ACIL_TARIH || row.KAYIT_TARIHI;
    if (acilDate) {
      return acilDate === currentSelectedDateIso;
    }
    return true;
  }

  // Sekreter bu hastayı bu tarih için manuel olarak listeye eklediyse göster
  if (row.MANUEL_BUGUN_TARIH === currentSelectedDateIso) return true;

  // Yeni eklenen hastalar SADECE eklendikleri tarihten itibaren (bugün ve gelecek tarihlerde) görünür,
  // eklendiği tarihten önceki geçmiş tarihlerde (Örn: 4 Kasım'da eklenen hasta 2 Kasım'da) ASLA görünmez!
  if (row.KAYIT_TARIHI && currentSelectedDateIso < row.KAYIT_TARIHI) {
    return false;
  }

  const selectedWeekday = getWeekdayCodeFromIsoDate(currentSelectedDateIso);
  if (selectedWeekday === 'PAZ') return false;

  // Her gün gelen rutin hasta Pazar hariç her gün gelir
  if (row.GUN_GRUBU === 'HER_GUN') return true;

  const patientDays = getPatientDaysArray(row.GUN_GRUBU, row.OZEL_GUNLER);
  return patientDays.includes(selectedWeekday);
}

let currentSelectedDateIso = getTodayIsoString();
let currentSelectedDayGroup = getDayGroupFromIsoDate(currentSelectedDateIso);
let lastCalendarAutoCheckDate = getTodayIsoString();

function updateCalendarInfoBar() {
  const dateInp = document.getElementById('inp-session-date');
  if (dateInp && dateInp.value !== currentSelectedDateIso) {
    dateInp.value = currentSelectedDateIso;
  }

  const sDateInp = document.getElementById('sidebar-session-date');
  if (sDateInp && sDateInp.value !== currentSelectedDateIso) {
    sDateInp.value = currentSelectedDateIso;
  }

  const syncBadge = document.getElementById('calendar-auto-sync-status');
  if (syncBadge) {
    syncBadge.textContent = `📅 ${formatDateTR(currentSelectedDateIso)} • ${getWeekdayFullNameTR(currentSelectedDateIso)} Seans Listesi`;
  }
}

function onCalendarDateChange() {
  const dateInp = document.getElementById('inp-session-date');
  if (!dateInp || !dateInp.value) return;
  currentSelectedDateIso = dateInp.value;
  currentSelectedDayGroup = getDayGroupFromIsoDate(currentSelectedDateIso);

  const sDateInp = document.getElementById('sidebar-session-date');
  if (sDateInp) sDateInp.value = currentSelectedDateIso;

  updateCalendarInfoBar();
  executeDailyOracleQuery(true);
}

function onSidebarDateChange(val) {
  if (!val) return;
  currentSelectedDateIso = val;
  currentSelectedDayGroup = getDayGroupFromIsoDate(currentSelectedDateIso);

  const mainDateInp = document.getElementById('inp-session-date');
  if (mainDateInp) mainDateInp.value = val;

  updateCalendarInfoBar();
  executeDailyOracleQuery(true);
  showToast(`📅 Seans Tarihi Değiştirildi: ${formatDateTR(val)} (${getWeekdayFullNameTR(val)})`);
}

function selectQuickDayOffset(dayOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const iso = d.toISOString().split('T')[0];
  onSidebarDateChange(iso);
}

function onDayGroupFilterChange() {
  onCalendarDateChange();
}

const syncChannel = (typeof BroadcastChannel !== 'undefined')
  ? new BroadcastChannel('diyaliz_ekran_senkron_kanali')
  : null;

function hydrateSeansItem(item) {
  const safeDuration = (Number(item.plannedDurationMinutes) && Number(item.plannedDurationMinutes) >= 60)
    ? Number(item.plannedDurationMinutes)
    : STANDART_DIYALIZ_SURESI_DK;
  return {
    ...item,
    plannedDurationMinutes: safeDuration,
    instruction: item.status === 'BEKLEMEDE' || item.status === 'BAGLANDI' || item.status === 'TABURCU' ? '' : (item.instruction || ''),
    countdownEndsAt: item.countdownEndsAt ? new Date(item.countdownEndsAt) : null,
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
  };
}

function broadcastSyncState(options = {}) {
  const tickerEl = document.getElementById('tv-ticker-text');
  const packet = {
    timestamp: Date.now(),
    senderId: INSTANCE_ID,
    calendarDate: currentSelectedDateIso,
    dayGroup: currentSelectedDayGroup,
    seansList: activeSeansList,
    targetSlideIndex: typeof options.targetSlideIndex === 'number' ? options.targetSlideIndex : null,
    tickerMessage: options.tickerMessage || (tickerEl ? tickerEl.textContent.trim() : null),
    playChime: Boolean(options.playChime),
    playFamilyChime: Boolean(options.playFamilyChime),
    toastMessage: options.toastMessage || null
  };

  lastAppliedSyncTimestamp = packet.timestamp;

  // 1. localStorage üzerine kaydet (Diğer sekmelerde 'storage' eventini tetikler ve kalıcılık sağlar)
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(packet));
  } catch (e) {
    console.warn('localStorage senkronizasyon kaydı hatası:', e);
  }

  // 2. BroadcastChannel üzerinden açık olan tüm TV Bekleme ve Sekreter pencerelerine anında ilet
  if (syncChannel) {
    try {
      syncChannel.postMessage(packet);
    } catch (e) {
      console.warn('BroadcastChannel gönderim hatası:', e);
    }
  }

  // 3. Sunucu çalışıyorsa (/api/sync-state) farklı tarayıcı/cihazlar için sunucu belleğini de güncelle
  fetch(resolveApiUrl('/api/sync-state'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(packet)
  }).catch(() => { });
}

function applyIncomingSyncPacket(packet) {
  if (!packet || !Array.isArray(packet.seansList)) return;
  if (packet.senderId === INSTANCE_ID) return;
  if (packet.timestamp && packet.timestamp <= lastAppliedSyncTimestamp) return;

  lastAppliedSyncTimestamp = packet.timestamp || Date.now();
  if (packet.calendarDate) currentSelectedDateIso = packet.calendarDate;
  if (packet.dayGroup) currentSelectedDayGroup = packet.dayGroup;
  activeSeansList = packet.seansList.map(hydrateSeansItem);

  if (packet.tickerMessage) {
    updateTickerMessage(packet.tickerMessage);
  }

  updateCalendarInfoBar();
  renderSecretaryPanel();
  renderTvSlides();

  if (typeof packet.targetSlideIndex === 'number') {
    goToSlide(packet.targetSlideIndex);
    startSlideAutomation();
  }

  if (packet.playFamilyChime) {
    playFamilyCallChime();
  } else if (packet.playChime) {
    playGentleChime();
  }

  if (packet.toastMessage) {
    showToast(packet.toastMessage);
  }
}

// BroadcastChannel dinleyicisi
if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event && event.data) {
      applyIncomingSyncPacket(event.data);
    }
  };
}

// localStorage 'storage' eventi dinleyicisi (Sekmeler arası anlık bildirim)
window.addEventListener('storage', (event) => {
  if (event.key === SYNC_STORAGE_KEY && event.newValue) {
    try {
      const packet = JSON.parse(event.newValue);
      applyIncomingSyncPacket(packet);
    } catch (e) {
      console.warn('Senkronizasyon verisi okunamadı:', e);
    }
  }
});

// Periyodik kontrol (file:// protokolü veya farklı tarayıcılar için yedek senkronizasyon)
setInterval(() => {
  try {
    const raw = localStorage.getItem(SYNC_STORAGE_KEY);
    if (raw) {
      const packet = JSON.parse(raw);
      if (packet && packet.timestamp > lastAppliedSyncTimestamp) {
        applyIncomingSyncPacket(packet);
      }
    }
  } catch (e) { }
}, 500);

// Sunucu (/api/sync-state) üzerinden farklı tarayıcı / cihazlar arası canlı senkronizasyon
if (window.location.protocol.startsWith('http')) {
  setInterval(async () => {
    try {
      const resp = await fetch(resolveApiUrl('/api/sync-state'), { cache: 'no-store' });
      if (resp.ok) {
        const packet = await resp.json();
        if (packet && packet.timestamp && packet.timestamp > lastAppliedSyncTimestamp) {
          applyIncomingSyncPacket(packet);
        }
      }
    } catch (e) { }
  }, 1500);
}

// EKRAN MODU YÖNETİMİ (Sekreter Ekranı / TV Bekleme Ekranı Ayrımı)
function switchScreenMode(mode) {
  const validMode = (mode === 'display') ? 'display' : 'secretary';
  document.body.setAttribute('data-screen-mode', validMode);

  const btnSec = document.getElementById('btn-switch-secretary');
  const btnDisp = document.getElementById('btn-switch-display');
  if (btnSec) btnSec.classList.toggle('active', validMode === 'secretary');
  if (btnDisp) btnDisp.classList.toggle('active', validMode === 'display');

  renderSecretaryPanel();
  renderTvSlides();
}

// Kalıcı Takvim ve Veritabanı Sorgusunu Çalıştıran Fonksiyon
async function executeDailyOracleQuery(isManualSync = false) {
  try {
    // Merkezi SQLite sunucusundan güncel seans ve hasta listesini çek
    try {
      const targetUrl = resolveApiUrl('/api/seanslar');
      const resp = await fetch(targetUrl, { cache: 'no-store' });
      if (resp.ok) {
        const sqliteRows = await resp.json();
        if (Array.isArray(sqliteRows) && sqliteRows.length > 0) {
          localStorage.setItem(MASTER_ROSTER_STORAGE_KEY, JSON.stringify(sqliteRows));
        }
      }
    } catch (_) { }

    ORACLE_RAW_DATABASE = loadMasterRoster();
    saveMasterRoster(ORACLE_RAW_DATABASE);
    updateCalendarInfoBar();

    // Sayfa ilk açıldığında (manuel yenileme değilse), aynı gün ve aynı gün grubu içinde sekreter ekranında
    // yapılmış güncel değişiklikler varsa onları koruyarak yükle (iki ekranın birebir aynı başlaması için)
    if (!isManualSync) {
      try {
        const savedRaw = localStorage.getItem(SYNC_STORAGE_KEY);
        if (savedRaw) {
          const savedPacket = JSON.parse(savedRaw);
          if (
            savedPacket &&
            Array.isArray(savedPacket.seansList) &&
            savedPacket.seansList.length > 0 &&
            savedPacket.calendarDate === currentSelectedDateIso &&
            (!savedPacket.dayGroup || savedPacket.dayGroup === currentSelectedDayGroup)
          ) {
            lastAppliedSyncTimestamp = savedPacket.timestamp || Date.now();
            // Kayıtlı oturumdaki hastaları güncel veritabanı gün ve isim/numara bilgileriyle doğrula
            const validSavedList = savedPacket.seansList
              .map(hydrateSeansItem)
              .filter(item => {
                const dbRow = ORACLE_RAW_DATABASE.find(
                  r => String(r.HASTASEANSREFNO) === String(item.seansId) || String(r.HASTANO) === String(item.tcNo)
                );
                if (!dbRow) return false;
                const nameParts = String(dbRow.HASTAADI || '').trim().split(/\s+/).filter(Boolean);
                item.firstName = nameParts[0] || item.firstName;
                item.lastName = nameParts.slice(1).join(' ') || item.lastName;
                item.maskedName = maskFullName(dbRow.HASTAADI);
                item.tcNo = String(dbRow.HASTANO || item.tcNo);
                item.vardiya = dbRow.VARDIYA || item.vardiya;
                return doesRowMatchSelectedFilter(dbRow);
              });
            if (validSavedList.length > 0) {
              activeSeansList = validSavedList;
              if (savedPacket.tickerMessage) {
                updateTickerMessage(savedPacket.tickerMessage);
              }
              if (validSavedList.length !== savedPacket.seansList.length) {
                broadcastSyncState();
              }
              return;
            }
          }
        }
      } catch (e) {
        console.warn('Kayıtlı senkron durumu okunamadı:', e);
      }
    }

    // Kalıcı Takvim & Esnek Gün Filtresi (Pzt-Çar-Cum, Sal-Per-Cmt veya Pzt-Çar-Cmt gibi özel günler)
    const filteredRows = ORACLE_RAW_DATABASE.filter(row => doesRowMatchSelectedFilter(row));

    activeSeansList = filteredRows.map(mapOracleRowToActiveSeans);
    showToast(`🔄 ${formatDateTR(currentSelectedDateIso)} (${getDayGroupLabel(currentSelectedDayGroup)}) için ${activeSeansList.length} hasta yüklendi.`);
    broadcastSyncState({
      toastMessage: isManualSync ? `🔄 Takvim listesi güncellendi (${activeSeansList.length} hasta).` : null
    });

  } catch (err) {
    console.error('Veritabanı veri çekme hatası:', err);
  } finally {
    renderSecretaryPanel();
    renderTvSlides();
  }
}

// Belli Zaman Aralıklarıyla ve Gün Geçişlerinde Otomatik Güncelleme Motoru (Yıllarca Kullanım)
function startMultiYearCalendarAutoRefresh() {
  // 1. Her 60 saniyede bir takvim gününü kontrol et (Gece 00:00'da yeni güne geçildiğinde otomatik sıfırla ve o günün listesini çek)
  setInterval(() => {
    const todayIso = getTodayIsoString();
    if (todayIso !== lastCalendarAutoCheckDate) {
      lastCalendarAutoCheckDate = todayIso;
      currentSelectedDateIso = todayIso;
      currentSelectedDayGroup = getDayGroupFromIsoDate(todayIso);
      updateCalendarInfoBar();
      executeDailyOracleQuery(true);
      showToast(`📅 Yeni gün algılandı (${formatDateTR(todayIso)}): ${getDayGroupLabel(currentSelectedDayGroup)} listesi otomatik yüklendi.`);
    } else {
      updateCalendarInfoBar();
    }
  }, 60 * 1000);

  // 2. Her 15 dakikada bir periyodik otomatik takvim/veritabanı senkronizasyonu
  setInterval(() => {
    updateCalendarInfoBar();
    ORACLE_RAW_DATABASE = loadMasterRoster();
  }, 15 * 60 * 1000);
}

// ============================================================================
// REST APİ İLE VERİTABANI MOTORUNA (database_engine.js) ANLIK SENKRONİZASYON
// ============================================================================
async function syncPatientChangeToApi(payload) {
  const targetUrl = resolveApiUrl('/api/seanslar');
  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Sunucu kapalıysa yerel veritabanı (localStorage) zaten güncellenmiştir
  }
  return null;
}


// ============================================================================
// SADECE UFAK ZİL SESİ (ZARİF MEDİKAL DING SESİ)
// Konuşma veya sesli anons tamamen kaldırıldı!
// ============================================================================
let audioCtx = null;
let soundEnabled = true;

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Tarayıcıda AudioContext askıda kalsa bile kesin ses çıkması için bellek içi WAV üretici
function createSynthesizedWavDataUri(notes, totalDurationSec = 1.6) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * totalDurationSec);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    for (let n = 0; n < notes.length; n++) {
      const note = notes[n];
      if (t >= note.start && t <= note.start + note.duration) {
        const localT = t - note.start;
        const attack = Math.min(1, localT / 0.02);
        const decay = Math.exp(-3.5 * (localT / note.duration));
        const env = attack * decay * (note.gain || 0.55);
        // Zengin hastane anons zili harmonikleri
        const wave = Math.sin(2 * Math.PI * note.freq * localT)
          + 0.35 * Math.sin(2 * Math.PI * (note.freq * 2) * localT)
          + 0.12 * Math.sin(2 * Math.PI * (note.freq * 3) * localT);
        sample += wave * env;
      }
    }
    const clamped = Math.max(-0.98, Math.min(0.98, sample));
    view.setInt16(44 + i * 2, Math.floor(clamped * 32767), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

let cachedGentleWavUri = null;
let cachedFamilyWavUri = null;

function playNotesWithWebAudio(notes) {
  initAudioContext();
  const runOscillators = () => {
    const now = audioCtx.currentTime;
    notes.forEach(note => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.start);
      gain.gain.setValueAtTime(0.001, now + note.start);
      gain.gain.linearRampToValueAtTime(note.gain || 0.5, now + note.start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + note.start);
      osc.stop(now + note.start + note.duration);
    });
  };

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().then(runOscillators).catch(() => { });
  } else {
    runOscillators();
  }
}

// Ufak, yumuşak ve zarif zil tonu (Ding)
function playGentleChime() {
  if (!soundEnabled) return;
  const notes = [{ freq: 880, start: 0.0, duration: 0.85, gain: 0.45 }];
  try {
    if (!cachedGentleWavUri) {
      cachedGentleWavUri = createSynthesizedWavDataUri(notes, 0.95);
    }
    const audio = new Audio(cachedGentleWavUri);
    audio.volume = 0.85;
    audio.play().catch(() => {
      playNotesWithWebAudio(notes);
    });
  } catch (e) {
    try { playNotesWithWebAudio(notes); } catch (_) { }
  }
}

// Hasta Yakını / Danışma Çağrısı İçin Dikkat Çekici 3 Tonlu Anons Zili (Ding - Dong - Ding)
function playFamilyCallChime() {
  if (!soundEnabled) return;
  const notes = [
    { freq: 1046.50, start: 0.0, duration: 0.48, gain: 0.65 }, // C6 (Ding)
    { freq: 783.99, start: 0.36, duration: 0.52, gain: 0.65 }, // G5 (Dong)
    { freq: 1318.51, start: 0.76, duration: 0.85, gain: 0.72 }  // E6 (Parlak Ding)
  ];
  try {
    if (!cachedFamilyWavUri) {
      cachedFamilyWavUri = createSynthesizedWavDataUri(notes, 1.7);
    }
    const audio = new Audio(cachedFamilyWavUri);
    audio.volume = 1.0;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        playNotesWithWebAudio(notes);
      });
    }
  } catch (e) {
    try { playNotesWithWebAudio(notes); } catch (_) { }
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle-btn');
  if (btn) {
    btn.classList.toggle('active', soundEnabled);
    btn.innerHTML = soundEnabled ? `
      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
      </svg>
      Bildirim Zili: Açık
    ` : `
      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
      </svg>
      Bildirim Zili: Kapalı
    `;
  }
}

// ============================================================================
// CANLI GERİ SAYIM VE TAHMİNİ SEANS BİTİŞ SAATİ MOTORU
// ============================================================================
function formatRemainingTime(targetDate) {
  if (!targetDate) return null;
  const diffMs = new Date(targetDate) - new Date();
  if (diffMs <= 0) return '00:00 (Tamamlandı)';

  const totalMinutes = Math.max(1, Math.round(diffMs / (60 * 1000)));
  // Süreleri 5'in en yakın katına yuvarla (Örn: 143 dk -> ~145 dk, 12 dk -> ~10 dk, min 5 dk)
  const roundedMinutes = totalMinutes < 5 ? 5 : Math.round(totalMinutes / 5) * 5;
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  const pad = (n) => String(n).padStart(2, '0');

  if (hours > 0) {
    return minutes > 0 ? `~${pad(hours)}sa ${pad(minutes)}dk` : `~${pad(hours)}sa`;
  }
  return `~${minutes} dk`;
}

// Tahmini Seans Bitiş Saati Hesaplayıcı (Örn: "17:45")
function formatEstimatedEndTime(targetDate) {
  if (!targetDate) return null;
  const end = new Date(targetDate);
  if (isNaN(end.getTime())) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

// SÜRE DOLDUĞUNDA OTOMATİK BİR SONRAKİ AŞAMAYA GEÇİRME MOTORU
function checkPatientTimersAndAdvanceFlow() {
  const now = Date.now();
  let hasChanges = false;
  let targetSlideOnAdvance = null;

  activeSeansList.forEach(patient => {
    // Sadece aktif geri sayımı olan ve iptal edilmemiş hastalar
    if (!patient.countdownEndsAt || patient.isAborted) return;

    const diff = new Date(patient.countdownEndsAt).getTime() - now;
    if (diff <= 0) {
      // Süre doldu! Durumuna göre bir sonraki aşamaya otomatik geçir:
      hasChanges = true;

      if (patient.status === 'ODAYA_CAGRILDI') {
        // 1. Muayene / Hazırlık Çağrısı Süresi Doldu:
        if (patient.isFirstDialysis) {
          patient.status = 'KATETER_TAKILIYOR';
          patient.statusText = 'Kateter Hazırlığı (30 dk)';
          patient.badgeClass = 'badge-teal';
          patient.slideGroup = 'BEKLEME';
          patient.instruction = '';
          patient.countdownEndsAt = new Date(Date.now() + 30 * 60 * 1000);
          patient.countdownType = 'KATETER';
          patient.isUrgentCall = false;
          targetSlideOnAdvance = 0;
          showToast(`⏳ ${patient.maskedName}: Kateter hazırlığına (30 dk) geçildi.`);
        } else {
          const durMin = STANDART_DIYALIZ_SURESI_DK; // 3 Saat (180 dk)
          patient.plannedDurationMinutes = durMin;
          patient.status = 'BAGLANDI';
          patient.statusText = 'Seans Devam Ediyor';
          patient.badgeClass = 'badge-purple';
          patient.slideGroup = 'DIYALIZ';
          patient.instruction = '';
          patient.countdownEndsAt = new Date(Date.now() + durMin * 60 * 1000);
          patient.countdownType = 'DIYALIZ';
          patient.isUrgentCall = false;
          targetSlideOnAdvance = 1;
          showToast(`🔌 ${patient.maskedName}: Diyaliz seansı (3 saat) otomatik başlatıldı.`);
        }
        playGentleChime();

      } else if (patient.status === 'KATETER_TAKILIYOR') {
        // 2. Kateter Hazırlığı (30 dk) Süresi Doldu -> Diyalize Bağla (3 Saat = 180 dk)
        const durMin = STANDART_DIYALIZ_SURESI_DK;
        patient.plannedDurationMinutes = durMin;
        patient.status = 'BAGLANDI';
        patient.statusText = 'Seans Devam Ediyor';
        patient.badgeClass = 'badge-purple';
        patient.slideGroup = 'DIYALIZ';
        patient.instruction = '';
        patient.countdownEndsAt = new Date(Date.now() + durMin * 60 * 1000);
        patient.countdownType = 'DIYALIZ';
        patient.isUrgentCall = false;
        targetSlideOnAdvance = 1;
        showToast(`🔌 ${patient.maskedName}: 30 dk kateter hazırlığı tamamlandı, diyaliz seansına (3 saat) geçildi.`);
        updateTickerMessage(`Bilgilendirme: ${patient.maskedName} diyaliz seansına bağlandı (3 saat).`);
        playGentleChime();

      } else if (patient.status === 'BAGLANDI' || patient.status === 'TEDAVI_SURUYOR' || patient.status === 'AYRILDI') {
        // 3. Diyaliz Seansı (2 Saat 25 Dk) veya Dinlenme Süresi Tamamlandı -> Doğrudan Seans Tamamlanma Aşamasına Geç!
        patient.status = 'TABURCU';
        patient.statusText = 'Seans Tamamlandı';
        patient.badgeClass = 'badge-green';
        patient.slideGroup = 'CIKIS';
        patient.instruction = '';
        patient.countdownEndsAt = null;
        patient.countdownType = null;
        patient.isUrgentCall = false;
        patient.isFamilyCall = false;
        targetSlideOnAdvance = 2;
        showToast(`✅ ${patient.maskedName}: Diyaliz süresi tamamlandı, Seans Tamamlandı aşamasına geçirildi.`);
        updateTickerMessage(`Bilgilendirme: ${patient.maskedName} diyaliz seansı tamamlanmıştır.`);
        playGentleChime();
      }

      // Kalıcı veritabanı kaydındaki STATU ve COUNTDOWN_ENDS_AT alanlarını güncelle
      ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
        if (String(r.HASTASEANSREFNO) === String(patient.seansId) || String(r.HASTANO) === String(patient.tcNo)) {
          return {
            ...r,
            STATU: patient.status,
            COUNTDOWN_ENDS_AT: patient.countdownEndsAt ? patient.countdownEndsAt.toISOString() : null
          };
        }
        return r;
      });
      saveMasterRoster(ORACLE_RAW_DATABASE);

      syncPatientChangeToApi({
        HASTASEANSREFNO: patient.seansId,
        STATU: patient.status,
        PRESENCE: patient.presence || 'GELDI',
        SURE: STANDART_DIYALIZ_SURESI_DK
      });
    }
  });

  if (hasChanges) {
    renderSecretaryPanel();
    renderTvSlides();
    broadcastSyncState({
      targetSlideIndex: targetSlideOnAdvance,
      playChime: true
    });
  }
}

function updateCountdownDisplays() {
  document.querySelectorAll('[data-countdown-id]').forEach(el => {
    const sId = parseInt(el.getAttribute('data-countdown-id'));
    const seans = activeSeansList.find(s => s.seansId === sId);
    if (seans && seans.countdownEndsAt) {
      el.textContent = formatRemainingTime(seans.countdownEndsAt);
    }
  });

  document.querySelectorAll('[data-sec-countdown-id]').forEach(el => {
    const sId = parseInt(el.getAttribute('data-sec-countdown-id'));
    const seans = activeSeansList.find(s => s.seansId === sId);
    if (seans && seans.countdownEndsAt) {
      el.textContent = `⏱ Kalan: ${formatRemainingTime(seans.countdownEndsAt)} • 🏁 Tahmini Bitiş: ${formatEstimatedEndTime(seans.countdownEndsAt)}`;
    }
  });

  if (editingScheduleSeansId) {
    updateDetailModalTimeSummary(editingScheduleSeansId);
  }
}

// 1. Otomatik Süreç Kontrolü (Aşama geçişleri için her saniye kontrol eder)
setInterval(() => {
  checkPatientTimersAndAdvanceFlow();
}, 1000);

// 2. Ekrandaki kalan sürelerin düzenli güncellenmesi (Her 15 saniyede bir yenilenir)
setInterval(() => {
  updateCountdownDisplays();
}, 15000);

// ============================================================================
// CAROUSEL & SLAYT MOTORU (MAX 4 HASTA SAYFALAMASI & OTOMATİK GEÇİŞ)
// ============================================================================
let currentSlideIndex = 0;
let totalTvSlidesCount = 1;
let tvSlideDataList = [];
let countdownSeconds = 15;
let countdownInterval = null;

// Slayt kategorisi tanımları (Sadeleştirilmiş, gereksiz alt yazılar kaldırıldı)
const SLIDE_GROUP_DEFINITIONS = [
  {
    group: 'BEKLEME',
    title: '1. BEKLEME & ÇAĞRI LİSTESİ',
    subtitle: '',
    bannerClass: 'banner-waiting',
    iconSvg: `<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
  },
  {
    group: 'DIYALIZ',
    title: '2. DİYALİZ SEANSI DEVAM EDENLER',
    subtitle: '',
    bannerClass: 'banner-dialysis',
    iconSvg: `<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`
  },
  {
    group: 'CIKIS',
    title: '3. SEANSI TAMAMLANANLAR',
    subtitle: '',
    bannerClass: 'banner-discharge',
    iconSvg: `<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
  }
];

// Aktif slaytın hasta sayısına göre dinamik süresini hesapla
function getDynamicSlideDuration(slideIdx) {
  if (selectedTvUnitParam) {
    return 10; // Sabit TV modunda otomatik kaydırma durdurulur
  }
  if (!tvSlideDataList || tvSlideDataList.length === 0) return 5;
  const slide = tvSlideDataList[slideIdx] || tvSlideDataList[0];
  const count = (slide && slide.patients) ? slide.patients.length : 0;
  if (count === 0) return 5;
  return 15 + (count * 5);
}

function goToSlide(index) {
  if (totalTvSlidesCount <= 0) return;
  currentSlideIndex = (index + totalTvSlidesCount) % totalTvSlidesCount;

  const track = document.getElementById('tv-carousel-track');
  if (track) {
    const offsetPercent = (100 / totalTvSlidesCount) * currentSlideIndex;
    track.style.transform = `translateX(-${offsetPercent}%)`;
  }

  document.querySelectorAll('#tv-slide-dots .slide-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlideIndex);
  });

  countdownSeconds = getDynamicSlideDuration(currentSlideIndex);
  updateTimerPill();
}

function nextSlide() {
  goToSlide(currentSlideIndex + 1);
}

function updateTimerPill() {
  const pill = document.getElementById('timer-pill');
  if (pill) {
    const totalSec = getDynamicSlideDuration(currentSlideIndex);
    pill.textContent = `Sonraki Ekran: ${countdownSeconds}s (${totalSec}s)`;
  }
}

function startSlideAutomation() {
  if (selectedTvUnitParam) {
    // Sabit TV Ünitesi (TV 1 Bekleme, TV 2 Diyaliz veya TV 3 Çıkış) modunda slayt döngüsü çalışmaz, sabit kalır
    const pill = document.getElementById('timer-pill');
    if (pill) {
      const tvNames = {
        '1': '📺 TV 1: Bekleme & Çağrı Salonu',
        '2': '📺 TV 2: Diyaliz Tedavi Ünitesi',
        '3': '📺 TV 3: Çıkış / Taburcu Alanı'
      };
      pill.textContent = tvNames[selectedTvUnitParam] || '📺 Özel TV Ünitesi';
      pill.style.background = '#0369a1';
    }
    return;
  }
  if (countdownInterval) clearInterval(countdownInterval);
  countdownSeconds = getDynamicSlideDuration(currentSlideIndex);
  updateTimerPill();

  countdownInterval = setInterval(() => {
    countdownSeconds--;
    if (countdownSeconds <= 0) {
      nextSlide();
    } else {
      updateTimerPill();
    }
  }, 1000);
}

// ============================================================================
// TV DISPLAY EKRANI RENDER (HASTA SAYISI ARTIŞINA DUYARLI DİNAMİK SAYFALAMA)
// ============================================================================
function getDynamicPatientsPerScreen() {
  const h = window.innerHeight || 900;
  if (h >= 1020) return 6;
  if (h >= 820) return 5;
  return 4;
}

// ============================================================================
// HASTA LİSTESİ SIRALAMA MOTORU:
// 1. Acilden gelen hastalar (ACIL_SERVIS) HER ZAMAN en üstte
// 2. Vardiyasına göre: Önce SABAH, sonra ÖĞLEN, sonra Vardiya Belirtilmemiş
// 3. Aynı vardiya içinde veya vardiya belirtilmemişse ALFABETİK (A -> Z, Türkçe)
// ============================================================================
function getVardiyaSortRank(vardiyaVal) {
  const s = String(vardiyaVal || '').trim().toLocaleUpperCase('tr-TR');
  if (s === 'SABAH') return 1;
  if (s === 'OGLEN' || s === 'ÖĞLEN' || s === 'OGLE' || s === 'ÖĞLE') return 2;
  return 3; // Belirtilmemiş
}

function formatVardiyaBadgeLabel(vardiyaVal, isEmergency = false) {
  if (isEmergency) return '🚨 Acil';
  const s = String(vardiyaVal || '').trim().toLocaleUpperCase('tr-TR');
  if (s === 'SABAH') return '🌅 Sabah';
  if (s === 'OGLEN' || s === 'ÖĞLEN' || s === 'OGLE' || s === 'ÖĞLE') return '☀️ Öğlen';
  return '';
}

function comparePatientsByPriority(a, b) {
  const isEmergA = (a.gelisTipi || a.BASVURUTURU) === 'ACIL_SERVIS' || (a.gunGrubu || a.GUN_GRUBU) === 'BUGUN';
  const isEmergB = (b.gelisTipi || b.BASVURUTURU) === 'ACIL_SERVIS' || (b.gunGrubu || b.GUN_GRUBU) === 'BUGUN';

  // 1. Acil hastalar her zaman listenin en üstünde
  if (isEmergA !== isEmergB) {
    return isEmergA ? -1 : 1;
  }

  // 2. Vardiyasına göre sıralama (Önce Sabah = 1, Sonra Öğlen = 2, Belirtilmemiş = 3)
  if (!isEmergA && !isEmergB) {
    const rankA = getVardiyaSortRank(a.vardiya ?? a.VARDIYA);
    const rankB = getVardiyaSortRank(b.vardiya ?? b.VARDIYA);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
  }

  // 3. Alfabetik sıralama (Türkçe A -> Z)
  const nameA = (a.HASTAADI || `${a.firstName || ''} ${a.lastName || ''}`).trim();
  const nameB = (b.HASTAADI || `${b.firstName || ''} ${b.lastName || ''}`).trim();
  return nameA.localeCompare(nameB, 'tr-TR', { sensitivity: 'base' });
}

function sortActiveSeansList() {
  activeSeansList.sort(comparePatientsByPriority);
}

let selectedTvUnitParam = null; // '1' (Bekleme), '2' (Diyaliz), '3' (Taburcu)

function renderTvSlides() {
  const track = document.getElementById('tv-carousel-track');
  const dotsContainer = document.getElementById('tv-slide-dots');
  if (!track) return;

  sortActiveSeansList();
  const perScreen = getDynamicPatientsPerScreen();

  // URL'den veya parametreden sabit TV ünitesi seçimi:
  // ?tv=1 -> TV 1 (Sadece Bekleme Salonu)
  // ?tv=2 -> TV 2 (Sadece Diyaliz Seansı Devam Edenler)
  // ?tv=3 -> TV 3 (Sadece Çıkış / Seansı Tamamlananlar)
  let activeDefinitions = SLIDE_GROUP_DEFINITIONS;
  if (selectedTvUnitParam === '1') {
    activeDefinitions = [SLIDE_GROUP_DEFINITIONS[0]];
  } else if (selectedTvUnitParam === '2') {
    activeDefinitions = [SLIDE_GROUP_DEFINITIONS[1]];
  } else if (selectedTvUnitParam === '3') {
    activeDefinitions = [SLIDE_GROUP_DEFINITIONS[2]];
  }

  // 1. Slayt Veri Listesini Üret
  tvSlideDataList = [];

  activeDefinitions.forEach(def => {
    const groupPatients = activeSeansList.filter(s => s.slideGroup === def.group);
    const totalCount = groupPatients.length;

    if (totalCount === 0) {
      tvSlideDataList.push({
        group: def.group,
        title: def.title,
        subtitle: def.subtitle,
        bannerClass: def.bannerClass,
        iconSvg: def.iconSvg,
        patients: [],
        totalCount: 0,
        pageNum: 1,
        totalPages: 1
      });
    } else {
      const totalPages = Math.ceil(totalCount / perScreen);
      for (let p = 0; p < totalPages; p++) {
        const slice = groupPatients.slice(p * perScreen, (p + 1) * perScreen);
        tvSlideDataList.push({
          group: def.group,
          title: totalPages > 1 ? `${def.title} (${p + 1}/${totalPages})` : def.title,
          subtitle: def.subtitle,
          bannerClass: def.bannerClass,
          iconSvg: def.iconSvg,
          patients: slice,
          totalCount: totalCount,
          pageNum: p + 1,
          totalPages: totalPages
        });
      }
    }
  });

  totalTvSlidesCount = tvSlideDataList.length;
  track.style.width = `${totalTvSlidesCount * 100}%`;

  // 2. Slayt HTML'lerini oluştur
  track.innerHTML = tvSlideDataList.map((slide) => {
    const slideWidthPercent = 100 / totalTvSlidesCount;

    return `
      <div class="tv-slide" style="flex: 0 0 ${slideWidthPercent}%; width: ${slideWidthPercent}%; max-width: ${slideWidthPercent}%;">
        <div class="slide-banner ${slide.bannerClass}">
          <div class="slide-banner-info">
            <div class="banner-icon">
              ${slide.iconSvg}
            </div>
            <div class="banner-title-text">
              <h2>${slide.title}</h2>
            </div>
          </div>
          <div class="banner-count-badge">
            ${slide.totalCount} Hasta ${slide.totalPages > 1 ? `• [${slide.pageNum}/${slide.totalPages}]` : ''}
          </div>
        </div>

        <div class="tv-patient-grid">
          ${slide.patients.length === 0 ? `
            <div style="padding: 40px 20px; text-align: center; color: var(--text-dim); font-size: 14px; font-weight: 600;">
              Bu aşamada hasta bulunmamaktadır.
            </div>
          ` : slide.patients.map(p => {
      const isFamilyCallRow = Boolean(p.isFamilyCall || p.status === 'YAKINI_CAGRILIYOR');
      let alertClass = '';
      if (p.isUrgentCall) alertClass = 'calling-urgent-active';
      else if (isFamilyCallRow) alertClass = 'family-call-active';
      else if (p.isAborted) alertClass = 'aborted-active';

      const estEndTime = p.countdownEndsAt ? formatEstimatedEndTime(p.countdownEndsAt) : null;

      // Sadece Bekleme Ekranında (TV Display) hasta yakını çağrılırken dikkat çekici TURUNCU renk kullanılır
      const familyRowInlineStyle = isFamilyCallRow
        ? 'background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%); border: 2.5px solid #f97316; border-left: 8px solid #ea580c; box-shadow: 0 6px 22px rgba(249, 115, 22, 0.32);'
        : '';
      const familyNameInlineStyle = isFamilyCallRow ? 'color: #9a3412;' : '';
      const familySubtextInlineStyle = isFamilyCallRow ? 'color: #c2410c; font-weight: 800;' : '';
      const familyBadgeInlineStyle = isFamilyCallRow
        ? 'background: linear-gradient(135deg, #f97316, #ea580c); color: #ffffff; border: 2px solid #c2410c; box-shadow: 0 3px 12px rgba(249, 115, 22, 0.38);'
        : '';

      const cleanSubtext = p.instruction ? p.instruction.trim() : '';

      return `
              <div class="tv-patient-row ${alertClass}" style="${familyRowInlineStyle}">
                <div class="tv-patient-name-block">
                  <div class="tv-patient-text-group">
                    <div class="masked-name-text">
                      <span class="patient-masked-name" style="${familyNameInlineStyle}">${p.maskedName}</span>
                    </div>
                    ${cleanSubtext ? `
                      <div class="masked-subtext" style="${familySubtextInlineStyle}">
                        <span>${cleanSubtext}</span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <div class="tv-right-info">
                  ${p.countdownEndsAt ? `
                    <div class="tv-timer-display ${p.countdownType === 'KATETER' ? 'catheter-style' : ''}">
                      <span class="time-val" data-countdown-id="${p.seansId}">
                        ${formatRemainingTime(p.countdownEndsAt)}
                      </span>
                      <span class="time-lbl">
                        ${p.countdownType === 'HAZIRLIK' ? 'Hazırlık' : (p.countdownType === 'KATETER' ? 'Kateter (30 dk)' : 'Kalan Süre')}
                      </span>
                      ${estEndTime ? `
                        <span class="time-end-estimate" style="display: block; margin-top: 3px; font-size: 11px; font-weight: 800; color: #0f766e; background: rgba(13, 148, 136, 0.12); padding: 2px 7px; border-radius: 4px;">
                          🏁 Bitiş: ${estEndTime}
                        </span>
                      ` : ''}
                    </div>
                  ` : ''}

                  <div class="tv-status-badge ${p.badgeClass}" style="${familyBadgeInlineStyle}">
                    <span>●</span>
                    <span>${p.statusText}</span>
                  </div>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  }).join('');

  // 3. Slide Gösterge Noktalarını (Dots) güncelle
  if (dotsContainer) {
    dotsContainer.innerHTML = tvSlideDataList.map((slide, idx) => `
      <div class="slide-dot ${idx === currentSlideIndex ? 'active' : ''}" 
           title="${slide.title}" 
           onclick="goToSlide(${idx})"></div>
    `).join('');
  }

  if (currentSlideIndex >= totalTvSlidesCount) {
    currentSlideIndex = 0;
  }
  goToSlide(currentSlideIndex);
}

// ============================================================================
// SEKRETER KONTROL PANELİ RENDER (SADE, ANLAŞILIR VE HIZLI ARAYÜZ)
// ============================================================================
let secretarySearchTerm = '';

function formatDurationLabel(minutes) {
  const m = Number(minutes) || 180;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (h > 0 && rem > 0) return `${h} sa ${rem} dk`;
  if (h > 0) return `${h} saat`;
  return `${rem} dk`;
}

function renderSecretaryPanel() {
  const container = document.getElementById('secretary-patient-list');
  if (!container) return;

  // Her zaman: 1) Acil hastalar en üstte, 2) Önce Sabah sonra Öğlen vardiyası, 3) Alfabetik (A-Z)
  sortActiveSeansList();

  const filtered = activeSeansList.filter(s => {
    const target = `${s.firstName} ${s.lastName} ${s.maskedName} ${s.protokolNo} ${s.tcNo}`.toLowerCase();
    return target.includes(secretarySearchTerm.toLowerCase());
  });

  const totalCountEl = document.getElementById('secretary-total-count');
  if (totalCountEl) {
    const emergencyCount = activeSeansList.filter(s => s.gelisTipi === 'ACIL_SERVIS').length;
    totalCountEl.textContent = emergencyCount > 0
      ? `${activeSeansList.length} Hasta (${emergencyCount} Acil)`
      : `${activeSeansList.length} Hasta`;
  }

  container.innerHTML = filtered.map(patient => {
    const isEmergency = patient.gelisTipi === 'ACIL_SERVIS' || patient.gunGrubu === 'BUGUN';
    const shiftLabel = formatVardiyaBadgeLabel(patient.vardiya, isEmergency);
    const shiftClass = isEmergency
      ? 'shift-badge-emergency'
      : (getVardiyaSortRank(patient.vardiya) === 1 ? 'shift-badge-morning' : (getVardiyaSortRank(patient.vardiya) === 2 ? 'shift-badge-afternoon' : ''));

    return `
    <div class="secretary-patient-card ${isEmergency ? 'card-emergency-patient' : ''}" id="sec-card-${patient.seansId}">
      <!-- SOL BÖLÜM: Hastanın Maskeli Adı Soyadı (KVKK Uyumlu - İlk 3 Harf Açık, Tıklanabilir Detay Pop-up'ta Tam Adı Görünür), Hasta Numarası ve Vardiya -->
      <div class="card-top">
        <div class="patient-info-left">
          <button type="button" class="patient-name-clickable" onclick="openPatientScheduleModal(${patient.seansId})" title="KVKK Detay: Hastanın tam adını, süresini, vardiya ve günlerini düzenlemek için tıklayınız">
            <span>${patient.maskedName}</span>
            <span class="name-detail-hint">Detay ▸</span>
          </button>
          <span class="patient-id-badge">Hasta No: ${patient.tcNo || '-'}</span>
          ${shiftLabel ? `<span class="patient-shift-badge ${shiftClass}">${shiftLabel}</span>` : ''}
        </div>
        
        <span class="status-badge-mini ${patient.badgeClass}">
          ${patient.statusText}
        </span>
      </div>

      <!-- SAĞ BÖLÜM: Diyaliz Durumu Seçimi ve Uygula Butonu -->
      <div class="card-unified-controls">
        <div class="status-control-group">
          <div class="custom-select-container">
            <select id="sel-status-${patient.seansId}" class="status-combobox" onchange="onStatusDropdownChange(${patient.seansId})">
              <option value="BEKLEMEDE" ${patient.status === 'BEKLEMEDE' ? 'selected' : ''}>⏳ 1. Bekleme Salonunda</option>
              <option value="ODAYA_CAGRILDI" ${patient.status === 'ODAYA_CAGRILDI' ? 'selected' : ''}>🔔 2. Odaya Çağır (Hazırlık)</option>
              <option value="KATETER_TAKILIYOR" ${patient.status === 'KATETER_TAKILIYOR' ? 'selected' : ''}>⏱️ 3. Kateter Hazırlığı (30 dk)</option>
              <option value="BAGLANDI" ${patient.status === 'BAGLANDI' ? 'selected' : ''}>🔌 4. Diyalize Bağla (3 saat)</option>
              <option value="YAKINI_CAGRILIYOR" ${patient.status === 'YAKINI_CAGRILIYOR' ? 'selected' : ''}>ℹ️ 5. Danışma / Yakını Çağrısı</option>
              <option value="YARIDA_KALDI" ${patient.status === 'YARIDA_KALDI' ? 'selected' : ''}>📋 6. Hekim Kararıyla Erken Durdurma</option>
              <option value="AYRILDI" ${patient.status === 'AYRILDI' ? 'selected' : ''}>🛏️ 7. Dinlenme / Gözlem</option>
              <option value="TABURCU" ${patient.status === 'TABURCU' ? 'selected' : ''}>✅ 8. Seans Tamamlandı / Taburcu</option>
            </select>
            <div class="select-chevron">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>

          <button type="button" class="btn-save-status" id="btn-save-${patient.seansId}" onclick="savePatientStatusChange(${patient.seansId})">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Uygula
          </button>
        </div>
      </div>
    </div>
    `;
  }).join('');
}

// Dropdown seçimi değiştiğinde kaydet butonunu vurgula
function onStatusDropdownChange(seansId) {
  const btn = document.getElementById(`btn-save-${seansId}`);
  if (btn) {
    btn.classList.add('has-changes');
  }
}

// Durumu Uygula butonuna tıklandığında seçilen durumu TV ekranına ve sisteme yansıt
function savePatientStatusChange(seansId) {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }

  const selectEl = document.getElementById(`sel-status-${seansId}`);
  if (!selectEl) return;

  const chosenStatus = selectEl.value;

  // Seçilen duruma göre ilgili motor fonksiyonlarını çalıştır
  switch (chosenStatus) {
    case 'BEKLEMEDE':
      setPatientStatus(seansId, 'BEKLEMEDE');
      break;
    case 'ODAYA_CAGRILDI':
      triggerCallPatientToRoom(seansId);
      break;
    case 'KATETER_TAKILIYOR':
      triggerCatheterCountdown(seansId);
      break;
    case 'BAGLANDI':
      triggerDialysisCountdown(seansId);
      break;
    case 'YAKINI_CAGRILIYOR':
      triggerCallFamily(seansId);
      break;
    case 'YARIDA_KALDI':
      triggerEarlyStopByDoctor(seansId);
      break;
    case 'AYRILDI':
      setPatientStatus(seansId, 'AYRILDI');
      break;
    case 'TABURCU':
      setPatientStatus(seansId, 'TABURCU');
      break;
    default:
      setPatientStatus(seansId, chosenStatus);
      break;
  }
}

// 1. Standart Durum Değiştirme
function setPatientStatus(seansId, statusCode) {
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  patient.status = statusCode;
  patient.isUrgentCall = false;
  patient.isFamilyCall = false;
  patient.isAborted = false;
  patient.abortReason = '';
  patient.countdownEndsAt = null;
  patient.countdownType = null;

  if (statusCode === 'BEKLEMEDE') {
    patient.statusText = 'Bekleme Salonunda';
    patient.badgeClass = 'badge-blue';
    patient.slideGroup = 'BEKLEME';
    patient.instruction = 'Hazırlık sırası bekleniyor. Lütfen ekrandaki yatak numaranızı takip ediniz.';
  } else if (statusCode === 'AYRILDI') {
    patient.statusText = 'Dinlenme / Gözlem';
    patient.badgeClass = 'badge-teal';
    patient.slideGroup = 'CIKIS';
    patient.instruction = 'Seans tamamlanmıştır. Hastamız dinlenme alanında tansiyon takibindedir.';
  } else if (statusCode === 'TABURCU') {
    patient.statusText = 'İşlemler Tamamlandı';
    patient.badgeClass = 'badge-green';
    patient.slideGroup = 'CIKIS';
    patient.instruction = 'Bugünkü tedavi başarıyla tamamlanmıştır.';
  }

  // Durum değişikliğini kalıcı hafızaya ve SQLite'a yansıt
  ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
    if (String(r.HASTASEANSREFNO) === String(seansId) || String(r.HASTANO) === String(patient.tcNo)) {
      return {
        ...r,
        STATU: statusCode,
        COUNTDOWN_ENDS_AT: null
      };
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  renderSecretaryPanel();
  renderTvSlides();
  const targetSlide = (statusCode === 'AYRILDI' || statusCode === 'TABURCU') ? 2 : 0;
  goToSlide(targetSlide);
  showToast(`${patient.maskedName} durumu güncellendi.`);

  broadcastSyncState({
    targetSlideIndex: targetSlide,
    toastMessage: `🔄 ${patient.maskedName}: ${patient.statusText}`
  });

  // REST API ile sekreter ekranından TV Display'e veri gönder (emirhan.txt Madde 8 & 9)
  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: statusCode,
    PRESENCE: patient.presence || 'GELDI'
  });
}

// 2. Odaya Çağrı (Hazırlık Odasına Geçiş Süreci - Süre bitince otomatik sonraki aşamaya geçer)
function triggerCallPatientToRoom(seansId) {
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  patient.status = 'ODAYA_CAGRILDI';
  patient.statusText = 'Hazırlık Odasına Geçiniz';
  patient.badgeClass = 'badge-blue';
  patient.slideGroup = 'BEKLEME';
  patient.isUrgentCall = true;
  patient.isFamilyCall = false;
  patient.isAborted = false;
  patient.abortReason = '';
  // Muayene / Tartı & Ön Hazırlık çağrısı için otomatik 3 dakikalık intikal ve hazırlık süresi
  patient.countdownEndsAt = new Date(Date.now() + 3 * 60 * 1000);
  patient.countdownType = 'HAZIRLIK';
  patient.instruction = 'Lütfen Diyaliz Hazırlık Odasına Geçiniz (Tartı ve Ön Kontrol).';

  ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
    if (String(r.HASTASEANSREFNO) === String(seansId) || String(r.HASTANO) === String(patient.tcNo)) {
      return {
        ...r,
        STATU: 'ODAYA_CAGRILDI',
        COUNTDOWN_ENDS_AT: patient.countdownEndsAt.toISOString()
      };
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  goToSlide(0);

  // SADECE ZARİF BİR ZİL ÇALAR
  playGentleChime();

  const tickerMsg = `Bilgilendirme: ${patient.maskedName} hazırlık için davet edildi.`;
  renderSecretaryPanel();
  renderTvSlides();
  updateTickerMessage(tickerMsg);
  showToast(`🔔 ${patient.maskedName} odaya çağrıldı (Ön hazırlık süresi başladı).`);

  broadcastSyncState({
    targetSlideIndex: 0,
    tickerMessage: tickerMsg,
    playChime: true,
    toastMessage: `🔔 ${patient.maskedName} hazırlık odasına çağrıldı.`
  });

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'ODAYA_CAGRILDI',
    PRESENCE: patient.presence || 'GELDI'
  });
}

// 3. Kateter Takılıyor (30 Dakika - Süre bitince otomatik 2 sa 25 dk diyaliz seansına geçer)
function triggerCatheterCountdown(seansId) {
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  patient.status = 'KATETER_TAKILIYOR';
  patient.statusText = 'Kateter Hazırlığı (30 dk)';
  patient.badgeClass = 'badge-teal';
  patient.slideGroup = 'BEKLEME';
  patient.instruction = '';
  patient.countdownEndsAt = new Date(Date.now() + 30 * 60 * 1000);
  patient.countdownType = 'KATETER';
  patient.isUrgentCall = false;
  patient.isFamilyCall = false;
  patient.isAborted = false;
  patient.abortReason = '';

  ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
    if (String(r.HASTASEANSREFNO) === String(seansId) || String(r.HASTANO) === String(patient.tcNo)) {
      return { ...r, STATU: 'KATETER_TAKILIYOR', COUNTDOWN_ENDS_AT: patient.countdownEndsAt.toISOString() };
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  goToSlide(0);
  renderSecretaryPanel();
  renderTvSlides();
  showToast(`⏳ ${patient.maskedName} için 30 dakikalık kateter hazırlığı başladı.`);

  broadcastSyncState({
    targetSlideIndex: 0,
    toastMessage: `⏳ ${patient.maskedName} kateter hazırlığı başladı (30 dk).`
  });

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'KATETER_TAKILIYOR',
    PRESENCE: patient.presence || 'GELDI'
  });
}

// 4. Makineye Bağlandı (Her Hasta İçin Standart 3 Saat = 180 Dk; Süre bitince Seans Tamamlandı aşamasına geçer)
function triggerDialysisCountdown(seansId) {
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  const durationMinutes = STANDART_DIYALIZ_SURESI_DK; // 180 dk (3 saat)
  patient.plannedDurationMinutes = durationMinutes;
  patient.status = 'BAGLANDI';
  patient.statusText = 'Seans Devam Ediyor';
  patient.badgeClass = 'badge-purple';
  patient.slideGroup = 'DIYALIZ';
  patient.instruction = '';
  patient.countdownEndsAt = new Date(Date.now() + durationMinutes * 60 * 1000);
  patient.countdownType = 'DIYALIZ';
  patient.isUrgentCall = false;
  patient.isFamilyCall = false;
  patient.isAborted = false;

  ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
    if (String(r.HASTASEANSREFNO) === String(seansId) || String(r.HASTANO) === String(patient.tcNo)) {
      return {
        ...r,
        STATU: 'BAGLANDI',
        SURE: durationMinutes,
        COUNTDOWN_ENDS_AT: patient.countdownEndsAt.toISOString()
      };
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  goToSlide(1);
  renderSecretaryPanel();
  renderTvSlides();
  showToast(`🔌 ${patient.maskedName} diyalize bağlandı (3 saat).`);

  broadcastSyncState({
    targetSlideIndex: 1,
    toastMessage: `🔌 ${patient.maskedName} diyalize bağlandı (3 saat).`
  });

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'BAGLANDI',
    PRESENCE: patient.presence || 'GELDI',
    SURE: durationMinutes
  });
}

// 5. Danışma / Hasta Yakını Çağrısı (Dikkat Çekici Renk + Belirgin 3 Tonlu Çağrı Zili)
function triggerCallFamily(seansId) {
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  patient.status = 'YAKINI_CAGRILIYOR';
  patient.statusText = '🔔 Hasta Yakını Çağrısı (Danışma)';
  patient.badgeClass = 'badge-family-call';
  patient.slideGroup = 'BEKLEME';
  patient.isFamilyCall = true;
  patient.isUrgentCall = false;
  patient.isAborted = false;
  patient.instruction = `🔔 DİKKAT: ${patient.maskedName} Hasta Yakınının Danışmaya Uğraması Rica Olunur.`;

  ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
    if (String(r.HASTASEANSREFNO) === String(seansId) || String(r.HASTANO) === String(patient.tcNo)) {
      return {
        ...r,
        STATU: 'YAKINI_CAGRILIYOR'
      };
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  goToSlide(0);

  // HASTA YAKINI ÇAĞRISINA ÖZEL BELİRGİN 3 TONLU BİLDİRİM ZİLİ ÇALAR
  playFamilyCallChime();

  const tickerMsg = `🔔 DANIŞMA ÇAĞRISI: ${patient.maskedName} hasta yakınının danışmaya uğraması rica olunur.`;
  renderSecretaryPanel();
  renderTvSlides();
  updateTickerMessage(tickerMsg);
  showToast(`🔔 ${patient.maskedName} hasta yakını danışmaya çağrıldı (Sesli bildirim çalındı).`);

  broadcastSyncState({
    targetSlideIndex: 0,
    tickerMessage: tickerMsg,
    playChime: true,
    playFamilyChime: true,
    toastMessage: `🔔 ${patient.maskedName} yakını danışmaya davet edildi.`
  });

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'YAKINI_CAGRILIYOR',
    PRESENCE: patient.presence || 'GELDI'
  });
}

// 6. Hekim Kararıyla Erken Durdurma (KVKK Uyumlu: Neden Sorulmaz ve TV'de Tıbbi Gerekçe Gösterilmez)
function triggerEarlyStopByDoctor(seansId) {
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  patient.status = 'YARIDA_KALDI';
  patient.statusText = 'Hekim Kararıyla Erken Durdurma';
  patient.badgeClass = 'badge-soft-amber';
  patient.slideGroup = 'CIKIS';
  patient.isAborted = true;
  patient.isUrgentCall = false;
  patient.isFamilyCall = false;
  patient.instruction = 'Hekim değerlendirmesi neticesinde bugünkü seans tamamlanmıştır.';
  patient.countdownEndsAt = null;
  patient.countdownType = null;

  ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
    if (String(r.HASTASEANSREFNO) === String(seansId) || String(r.HASTANO) === String(patient.tcNo)) {
      return {
        ...r,
        STATU: 'YARIDA_KALDI',
        COUNTDOWN_ENDS_AT: null
      };
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  goToSlide(2);
  renderSecretaryPanel();
  renderTvSlides();

  const tickerMsg = `Bilgilendirme: ${patient.maskedName} bugünkü seansı hekim kontrolünde tamamlanmıştır.`;
  updateTickerMessage(tickerMsg);
  showToast(`📋 ${patient.maskedName}: Hekim kararıyla erken durdurma uygulandı.`);

  broadcastSyncState({
    targetSlideIndex: 2,
    tickerMessage: tickerMsg,
    toastMessage: `📋 ${patient.maskedName}: Hekim kararıyla erken durdurma`
  });

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'YARIDA_KALDI',
    PRESENCE: patient.presence || 'GELDI'
  });
}

// 7. Sekreter Yetkisiyle Diyaliz Süresini Uzatma / Değiştirme (+15 dk, +30 dk, +60 dk, -15 dk)
function extendPatientSessionTime(seansId, deltaMinutes) {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }

  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  const deltaMs = deltaMinutes * 60 * 1000;

  if (patient.countdownEndsAt) {
    // Aktif geri sayım varsa bitiş saatini doğrudan uzat/kısalt (En az 5 dk kalsın)
    const currentEndMs = new Date(patient.countdownEndsAt).getTime();
    const minEndMs = Date.now() + 5 * 60 * 1000;
    const newEndMs = Math.max(minEndMs, currentEndMs + deltaMs);
    patient.countdownEndsAt = new Date(newEndMs);

    if (patient.countdownType === 'DIYALIZ') {
      const remainingMin = Math.max(60, Math.round((newEndMs - Date.now()) / (60 * 1000)));
      patient.plannedDurationMinutes = remainingMin;
    }
  } else {
    // Henüz seans başlamadıysa planlanan diyaliz süresini güncelle (En az 60 dk, en fazla 360 dk)
    const currentPlanned = (Number(patient.plannedDurationMinutes) && Number(patient.plannedDurationMinutes) >= 60)
      ? Number(patient.plannedDurationMinutes)
      : STANDART_DIYALIZ_SURESI_DK;
    patient.plannedDurationMinutes = Math.min(360, Math.max(60, currentPlanned + deltaMinutes));
  }

  // Kalıcı veritabanı kaydındaki SURE ve COUNTDOWN_ENDS_AT alanlarını da güncelle
  ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
    if (String(r.HASTASEANSREFNO) === String(seansId) || String(r.HASTANO) === String(patient.tcNo)) {
      return {
        ...r,
        SURE: patient.plannedDurationMinutes,
        COUNTDOWN_ENDS_AT: patient.countdownEndsAt ? patient.countdownEndsAt.toISOString() : null
      };
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  const estEnd = patient.countdownEndsAt ? formatEstimatedEndTime(patient.countdownEndsAt) : null;
  const signLabel = deltaMinutes > 0 ? `+${deltaMinutes} dk uzatıldı` : `${deltaMinutes} dk kısaltıldı`;

  renderSecretaryPanel();
  renderTvSlides();

  showToast(`⏱️ ${patient.firstName} ${patient.lastName}: Seans süresi ${signLabel}${estEnd ? ` (Yeni Tahmini Bitiş: ${estEnd})` : ` (Yeni Süre: ${formatDurationLabel(patient.plannedDurationMinutes)})`}.`);

  broadcastSyncState({
    toastMessage: `⏱️ ${patient.maskedName} seans süresi güncellendi${estEnd ? ` • Tahmini Bitiş: ${estEnd}` : ''}`
  });

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: patient.status,
    SURE: patient.plannedDurationMinutes
  });
}

// YARDIMCI BİLEŞENLER
function updateTickerMessage(msg) {
  const ticker = document.getElementById('tv-ticker-text');
  if (ticker) ticker.textContent = msg;
}

function showToast(text) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = text;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3200);
}

function startClock() {
  const timeEl = document.getElementById('live-time');
  const dateEl = document.getElementById('live-date');
  function tick() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    if (timeEl) timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (dateEl) dateEl.textContent = now.toLocaleDateString('tr-TR', { weekday: 'short', month: 'long', day: 'numeric' });
  }
  tick();
  setInterval(tick, 1000);
}

// ============================================================================
// KULLANICI GİRİŞİ, HESAP YÖNETİMİ & OTURUM YÖNETİMİ (ADMIN & SEKRETER)
// ============================================================================
let isSecretaryLoggedIn = false;
let currentSecretaryUser = null;
let currentMainView = 'patients'; // 'patients' | 'account'

// Çevrimdışı / Yerel Yedek Kullanıcı Doğrulaması
const DEFAULT_FALLBACK_USERS = [
  { id: 1, username: 'admin', password: '1234', fullName: 'Sistem Yöneticisi', role: 'ADMIN', createdAt: new Date().toISOString() },
  { id: 2, username: 'sekreter', password: '1234', fullName: 'Özgül Bedge', role: 'SEKRETER', createdAt: new Date().toISOString() },
  { id: 3, username: 'hemsire', password: '1234', fullName: 'Nöbetçi Hemşire', role: 'HEMSIRE', createdAt: new Date().toISOString() }
];

function checkAuthStatus() {
  const savedUser = localStorage.getItem('diyaliz_logged_user');
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      if (userObj && userObj.username) {
        isSecretaryLoggedIn = true;
        currentSecretaryUser = userObj;
      } else {
        isSecretaryLoggedIn = false;
        currentSecretaryUser = null;
      }
    } catch (e) {
      isSecretaryLoggedIn = false;
      currentSecretaryUser = null;
    }
  } else {
    isSecretaryLoggedIn = false;
    currentSecretaryUser = null;
  }
  updateAuthUI();
}

function updateAuthUI() {
  // Sol Kenar Çubuğu (Sidebar) Öğeleri
  const sAvatar = document.getElementById('sidebar-user-avatar');
  const sName = document.getElementById('sidebar-user-name');
  const sBadge = document.getElementById('sidebar-user-role-badge');
  const sAuthTxt = document.getElementById('txt-sidebar-auth');
  const sAuthBtn = document.getElementById('btn-sidebar-auth');

  // Eski / Üst Bar Rozetleri (Varsa)
  const badge = document.getElementById('secretary-logged-badge');
  const btnLogin = document.getElementById('btn-login-open');
  const lockOverlay = document.getElementById('secretary-lock-overlay');
  const loggedName = document.getElementById('secretary-logged-name');

  if (isSecretaryLoggedIn && currentSecretaryUser) {
    const isAdmin = String(currentSecretaryUser.role || '').toUpperCase() === 'ADMIN';

    if (sAvatar) {
      sAvatar.textContent = isAdmin ? '👑' : '👤';
      if (isAdmin) sAvatar.classList.add('admin');
      else sAvatar.classList.remove('admin');
    }
    if (sName) sName.textContent = currentSecretaryUser.fullName || currentSecretaryUser.username;
    if (sBadge) {
      sBadge.textContent = isAdmin ? 'Yönetici (Admin)' : 'Sekreter';
      sBadge.className = `sidebar-user-role-badge ${isAdmin ? 'admin' : 'secretary'}`;
    }
    if (sAuthTxt) sAuthTxt.textContent = 'Güvenli Çıkış';
    if (sAuthBtn) {
      sAuthBtn.style.background = '#fef2f2';
      sAuthBtn.style.color = '#b91c1c';
      sAuthBtn.style.borderColor = '#fecaca';
    }

    if (badge) badge.style.display = 'flex';
    if (btnLogin) btnLogin.style.display = 'none';
    if (lockOverlay) lockOverlay.style.display = 'none';
    if (loggedName) loggedName.textContent = `👤 ${currentSecretaryUser.fullName}`;

    // Hesap Yönetimi görünümü açıksa bilgilerini doldur
    if (currentMainView === 'account') {
      loadAccountView();
    }
  } else {
    if (sAvatar) {
      sAvatar.textContent = '🔒';
      sAvatar.classList.remove('admin');
    }
    if (sName) sName.textContent = 'Giriş Yapılmadı';
    if (sBadge) {
      sBadge.textContent = 'Misafir';
      sBadge.className = 'sidebar-user-role-badge secretary';
    }
    if (sAuthTxt) sAuthTxt.textContent = 'Giriş Yap';
    if (sAuthBtn) {
      sAuthBtn.style.background = '#e0f2fe';
      sAuthBtn.style.color = '#0369a1';
      sAuthBtn.style.borderColor = '#7dd3fc';
    }

    if (badge) badge.style.display = 'none';
    if (btnLogin) btnLogin.style.display = 'flex';
    if (lockOverlay) lockOverlay.style.display = 'flex';
  }
}

function openLoginModal() {
  const modal = document.getElementById('login-modal');
  const errBox = document.getElementById('login-error-msg');
  if (errBox) errBox.style.display = 'none';
  if (modal) {
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
  const inp = document.getElementById('inp-login-username');
  if (inp) setTimeout(() => inp.focus(), 150);
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

async function handleSecretaryLogin(e) {
  e.preventDefault();
  const uInput = document.getElementById('inp-login-username').value.trim();
  const pInput = document.getElementById('inp-login-password').value.trim();
  const errBox = document.getElementById('login-error-msg');

  try {
    const res = await fetch(resolveApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ username: uInput, password: pInput })
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      isSecretaryLoggedIn = true;
      currentSecretaryUser = data.user;
      localStorage.setItem('diyaliz_logged_user', JSON.stringify(data.user));
      updateAuthUI();
      closeLoginModal();
      showToast(`🔓 Giriş Başarılı: Hoş geldiniz, ${data.user.fullName} (${data.user.role}).`);
      return;
    } else {
      throw new Error(data.error || 'Kullanıcı adı veya şifre hatalı!');
    }
  } catch (err) {
    // API'ye ulaşılamadıysa çevrimdışı fallback kontrolü yap
    const fallbackUser = DEFAULT_FALLBACK_USERS.find(
      u => u.username.toLowerCase() === uInput.toLowerCase() && u.password === pInput
    );
    if (fallbackUser) {
      isSecretaryLoggedIn = true;
      currentSecretaryUser = fallbackUser;
      localStorage.setItem('diyaliz_logged_user', JSON.stringify(fallbackUser));
      updateAuthUI();
      closeLoginModal();
      showToast(`🔓 Giriş Başarılı (Yerel Mod): Hoş geldiniz, ${fallbackUser.fullName}.`);
      return;
    }

    if (errBox) {
      errBox.textContent = err.message || 'Kullanıcı adı veya şifre hatalı!';
      errBox.style.display = 'block';
    }
  }
}

function logoutSecretary() {
  isSecretaryLoggedIn = false;
  currentSecretaryUser = null;
  localStorage.removeItem('diyaliz_logged_user');
  updateAuthUI();
  switchMainView('patients');
  showToast('🔒 Oturum güvenli şekilde sonlandırıldı.');
}

function toggleSidebarAuthAction() {
  if (isSecretaryLoggedIn) {
    logoutSecretary();
  } else {
    openLoginModal();
  }
}

// ============================================================================
// SOL MENÜDEN GÖRÜNÜM GEÇİŞİ: HASTA YÖNETİMİ, GÜN YÖNETİMİ vs HESAP YÖNETİMİ
// ============================================================================
function switchMainView(viewName) {
  currentMainView = viewName;
  const btnPatients = document.getElementById('btn-nav-patients');
  const btnSchedule = document.getElementById('btn-nav-schedule') || document.getElementById('btn-nav-days');
  const btnAccount = document.getElementById('btn-nav-account');

  const viewPatients = document.getElementById('view-patient-management');
  const viewSchedule = document.getElementById('view-schedule-management');
  const viewAccount = document.getElementById('view-account-management');

  // Buton aktiflik sınıflarını temizle
  if (btnPatients) btnPatients.classList.remove('active');
  if (btnSchedule) btnSchedule.classList.remove('active');
  if (btnAccount) btnAccount.classList.remove('active');

  // Tüm görünümleri gizle
  if (viewPatients) {
    viewPatients.classList.remove('active');
    viewPatients.style.display = 'none';
  }
  if (viewSchedule) {
    viewSchedule.classList.remove('active');
    viewSchedule.style.display = 'none';
  }
  if (viewAccount) {
    viewAccount.classList.remove('active');
    viewAccount.style.display = 'none';
  }

  if (viewName === 'schedule') {
    if (!isSecretaryLoggedIn) {
      openLoginModal();
      return;
    }
    if (btnSchedule) btnSchedule.classList.add('active');
    if (viewSchedule) {
      viewSchedule.classList.add('active');
      viewSchedule.style.display = 'flex';
    }
    renderDeletePatientModalList();
  } else if (viewName === 'account') {
    if (!isSecretaryLoggedIn) {
      openLoginModal();
      return;
    }
    if (btnAccount) btnAccount.classList.add('active');
    if (viewAccount) {
      viewAccount.classList.add('active');
      viewAccount.style.display = 'flex';
    }
    loadAccountView();
  } else {
    // 'patients' görünümü
    if (btnPatients) btnPatients.classList.add('active');
    if (viewPatients) {
      viewPatients.classList.add('active');
      viewPatients.style.display = 'flex';
    }
  }
}

// ============================================================================
// HESAP YÖNETİMİ & ADMIN SEKRETER YÖNETİMİ FONKSİYONLARI
// ============================================================================
async function loadAccountView() {
  if (!currentSecretaryUser) return;

  const isAdmin = String(currentSecretaryUser.role || '').toUpperCase() === 'ADMIN';

  // Profil Bilgilerini Doldur
  const uNameEl = document.getElementById('acc-info-username');
  const fNameEl = document.getElementById('acc-info-fullname');
  const roleEl = document.getElementById('acc-info-role');
  const dateEl = document.getElementById('acc-info-date');

  if (uNameEl) uNameEl.textContent = currentSecretaryUser.username;
  if (fNameEl) fNameEl.textContent = currentSecretaryUser.fullName;
  if (roleEl) {
    roleEl.innerHTML = isAdmin
      ? `<span class="badge-role-admin">Yönetici (Admin)</span>`
      : `<span class="badge-role-secretary">Sekreter</span>`;
  }
  if (dateEl) {
    dateEl.textContent = currentSecretaryUser.createdAt
      ? new Date(currentSecretaryUser.createdAt).toLocaleDateString('tr-TR')
      : 'Kayıtlı';
  }

  // Admin ise Sekreter Yönetim Alanını Göster
  const adminCard = document.getElementById('admin-secretary-management-card');
  if (adminCard) {
    if (isAdmin) {
      adminCard.style.display = 'block';
      loadSecretariesList();
    } else {
      adminCard.style.display = 'none';
    }
  }
}

async function loadSecretariesList() {
  const tbody = document.getElementById('secretary-table-body');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 16px;">Kullanıcılar yükleniyor...</td></tr>`;

  try {
    const res = await fetch(resolveApiUrl('/api/kullanicilar'));
    const data = await res.json();
    if (data.success && Array.isArray(data.users)) {
      renderSecretariesTable(data.users);
    } else {
      throw new Error(data.error || 'Kullanıcı listesi alınamadı.');
    }
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #b91c1c; padding: 16px;">Bağlantı hatası: ${e.message}</td></tr>`;
  }
}

function renderSecretariesTable(users) {
  const tbody = document.getElementById('secretary-table-body');
  if (!tbody) return;

  if (users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 16px;">Kayıtlı kullanıcı bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const isAdmin = u.ROL === 'ADMIN';
    const regDate = u.KAYIT_TARIHI ? new Date(u.KAYIT_TARIHI).toLocaleDateString('tr-TR') : '-';

    return `
      <tr>
        <td style="font-weight: 700; color: #64748b;">#${u.KULLANICI_ID}</td>
        <td style="font-weight: 800; color: #0284c7;">${u.KULLANICI_ADI}</td>
        <td style="font-weight: 700;">${u.AD_SOYAD}</td>
        <td>
          <span class="${isAdmin ? 'badge-role-admin' : 'badge-role-secretary'}">
            ${isAdmin ? '👑 ADMIN' : '👤 SEKRETER'}
          </span>
        </td>
        <td style="color: #64748b; font-size: 12px;">${regDate}</td>
        <td style="text-align: right;">
          ${isAdmin
        ? `<span style="font-size: 11px; color: #94a3b8; font-style: italic;">Silinemez (Yönetici)</span>`
        : `<button type="button" class="btn-action-small" style="font-size: 11px; color: #b91c1c; border-color: #fca5a5; background: #fef2f2;" onclick="deleteSecretaryById(${u.KULLANICI_ID}, '${u.AD_SOYAD.replace(/'/g, "\\'")}')">
                🗑️ Sekreteri Sil
              </button>`
      }
        </td>
      </tr>
    `;
  }).join('');
}

async function handleAddSecretarySubmit(e) {
  e.preventDefault();
  const username = document.getElementById('inp-sec-username').value.trim();
  const fullName = document.getElementById('inp-sec-fullname').value.trim();
  const password = document.getElementById('inp-sec-password').value.trim();

  if (!username || !fullName || !password) {
    alert('Lütfen tüm alanları eksiksiz doldurunuz!');
    return;
  }

  try {
    const res = await fetch(resolveApiUrl('/api/kullanicilar'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ username, fullName, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`✅ Yeni sekreter "${fullName}" başarıyla eklendi.`);
      document.getElementById('form-add-secretary').reset();
      loadSecretariesList();
    } else {
      alert(data.error || 'Sekreter eklenirken hata oluştu.');
    }
  } catch (err) {
    alert('Sunucu hatası: ' + err.message);
  }
}

async function deleteSecretaryById(userId, fullName) {
  const confirmed = window.confirm(`"${fullName}" isimli sekreter hesabını sistemden silmek istediğinize emin misiniz?`);
  if (!confirmed) return;

  try {
    const res = await fetch(resolveApiUrl(`/api/kullanicilar?id=${userId}`), {
      method: 'DELETE'
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast(`🗑️ Sekreter hesabı başarıyla silindi.`);
      loadSecretariesList();
    } else {
      alert(data.error || 'Sekreter silinemedi.');
    }
  } catch (err) {
    alert('Sunucu hatası: ' + err.message);
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  if (!currentSecretaryUser) return;

  const newPass = document.getElementById('inp-new-pass').value.trim();
  const newPassConfirm = document.getElementById('inp-new-pass-confirm').value.trim();

  if (newPass !== newPassConfirm) {
    alert('Girdiğiniz şifreler birbiriyle uyuşmuyor! Lütfen kontrol ediniz.');
    return;
  }
  if (newPass.length < 3) {
    alert('Şifre en az 3 karakter olmalıdır.');
    return;
  }

  try {
    const res = await fetch(resolveApiUrl('/api/kullanicilar/sifre'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify({ userId: currentSecretaryUser.id, newPassword: newPass })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showToast('✅ Şifreniz başarıyla güncellendi.');
      document.getElementById('form-change-password').reset();
    } else {
      alert(data.error || 'Şifre güncellenemedi.');
    }
  } catch (err) {
    alert('Sunucu hatası: ' + err.message);
  }
}

// ============================================================================
// SEKRETER YETKİSİYLE HASTA / ACİL HASTA EKLEME VE HASTA SİLME MOTORU
// ============================================================================
function onAddPatientTypeChange() {
  const typeSel = document.getElementById('inp-new-patient-type');
  const groupSel = document.getElementById('inp-new-patient-group');
  const extraFields = document.getElementById('routine-patient-extra-fields');
  const modalBox = document.getElementById('add-patient-modal-box');
  const titleEl = document.getElementById('add-patient-modal-title');
  const descEl = document.getElementById('add-patient-modal-desc');
  const submitBtn = document.getElementById('btn-submit-add-patient');

  const isEmergency = typeSel && typeSel.value === 'ACIL_SERVIS';
  if (isEmergency) {
    // Acil hasta ekleme ekranında SADECE Hasta Adı Soyadı ve Hasta No görünür
    if (extraFields) extraFields.style.display = 'none';
    if (modalBox) modalBox.style.borderTopColor = '#dc2626';
    if (titleEl) {
      titleEl.style.color = '#dc2626';
      titleEl.innerHTML = `🚨 Acil Hasta Girişi`;
    }
    if (descEl) {
      descEl.textContent = 'Acil gelen hastanın Adı Soyadı ve Hasta Numarasını giriniz (Sadece Bugün için kaydedilir).';
    }
    if (submitBtn) {
      submitBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
      submitBtn.textContent = '🚨 Acil Hastayı Kaydet';
    }
  } else {
    if (extraFields) extraFields.style.display = 'block';
    // Yeni hasta eklerken gün seçimi ZORUNLUDUR: başlangıçta hiçbir gün seçili gelmez
    document.querySelectorAll('.chk-new-patient-day').forEach(chk => {
      chk.checked = false;
    });
    if (modalBox) modalBox.style.borderTopColor = '#059669';
    if (titleEl) {
      titleEl.style.color = '#059669';
      titleEl.innerHTML = `➕ Yeni Hasta Ekle`;
    }
    if (descEl) {
      descEl.textContent = 'Lütfen hastanın adını, soyadını, hasta numarasını ve geleceği seans günlerini seçiniz.';
    }
    if (submitBtn) {
      submitBtn.style.background = '';
      submitBtn.textContent = 'Hastayı Kaydet';
    }
  }
}

// Yatak sayısı ileride artabileceği için yatak listesini dinamik olarak genişleten yardımcı fonksiyon
function getMaxBedCapacity() {
  const maxInDb = ORACLE_RAW_DATABASE.reduce((max, r) => Math.max(max, Number(r.YATAKNO) || 0), 0);
  const maxInActive = activeSeansList.reduce((max, s) => Math.max(max, Number(s.bedNo) || 0), 0);
  return Math.max(30, maxInDb + 10, maxInActive + 10);
}

function populateDynamicBedSelect(selectEl, selectedBedNo = 1) {
  if (!selectEl) return;
  const maxBeds = getMaxBedCapacity();
  const targetVal = Number(selectedBedNo) || 1;
  const limit = Math.max(maxBeds, targetVal + 5);
  let html = '';
  for (let i = 1; i <= limit; i++) {
    html += `<option value="${i}" ${i === targetVal ? 'selected' : ''}>${i} Nolu Yatak</option>`;
  }
  selectEl.innerHTML = html;
  selectEl.value = String(targetVal);
}

function openAddPatientModal(mode = 'RUTIN') {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }

  const form = document.getElementById('form-add-patient');
  if (form) form.reset();

  const typeSel = document.getElementById('inp-new-patient-type');
  if (typeSel) {
    typeSel.value = (mode === 'ACIL') ? 'ACIL_SERVIS' : 'PLANLANDI';
  }
  onAddPatientTypeChange();

  // Uygun boş yatak numarasını sınırsız kapasiteyle otomatik öner
  const bedSelect = document.getElementById('inp-new-patient-bed');
  if (bedSelect) {
    const occupiedBeds = activeSeansList.filter(s => s.status !== 'TABURCU').map(s => Number(s.bedNo));
    let suggested = 1;
    while (occupiedBeds.includes(suggested)) {
      suggested++;
    }
    populateDynamicBedSelect(bedSelect, suggested);
  }

  const modal = document.getElementById('add-patient-modal');
  if (modal) modal.classList.add('active');

  const nameInp = document.getElementById('inp-new-patient-name');
  if (nameInp) setTimeout(() => nameInp.focus(), 100);
}

function closeAddPatientModal() {
  const modal = document.getElementById('add-patient-modal');
  if (modal) modal.classList.remove('active');
}

function validateHastaNo(rawNo) {
  const cleaned = String(rawNo || '').trim();
  if (!cleaned) {
    return {
      valid: false,
      message: 'Hasta Numarası zorunlu bir alandır! Lütfen boş bırakmayınız.'
    };
  }
  if (!/^\d+$/.test(cleaned)) {
    return {
      valid: false,
      message: 'Hasta Numarası sadece rakamlardan (0-9) oluşmalıdır!'
    };
  }
  if (cleaned.length < 5 || cleaned.length > 8) {
    return {
      valid: false,
      message: `Hasta Numarası en az 5, en fazla 8 karakter (rakam) olmalıdır! (Girilen: ${cleaned.length} karakter)`
    };
  }
  return { valid: true, value: cleaned };
}

function handleAddPatientSubmit(e) {
  e.preventDefault();
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }

  const basvuruTuru = document.getElementById('inp-new-patient-type')?.value || 'PLANLANDI';
  const fullNameRaw = (document.getElementById('inp-new-patient-name')?.value || '').trim().toLocaleUpperCase('tr-TR');
  const hastaNoInputVal = (document.getElementById('inp-new-patient-no')?.value || '').trim();
  const durationVal = STANDART_DIYALIZ_SURESI_DK;
  const shiftSelVal = document.getElementById('inp-new-patient-shift')?.value || 'SABAH';
  const vardiya = basvuruTuru === 'ACIL_SERVIS' ? 'ACİL' : shiftSelVal;

  // Uygun yatak numarası (Acil modda otomatik boş yatak, rutin modda seçilen yatak)
  const occupiedBeds = activeSeansList.filter(s => s.status !== 'TABURCU').map(s => Number(s.bedNo));
  let autoBed = 1;
  while (occupiedBeds.includes(autoBed)) autoBed++;
  const bedNoVal = basvuruTuru === 'ACIL_SERVIS'
    ? autoBed
    : parseInt(document.getElementById('inp-new-patient-bed')?.value || String(autoBed), 10);

  if (!fullNameRaw) {
    alert('Lütfen hasta adı ve soyadını giriniz.');
    return;
  }

  // Hasta numarası ZORUNLUDUR, sadece rakamlardan oluşmalı, min 6 - max 8 karakter olmalıdır!
  const noValidation = validateHastaNo(hastaNoInputVal);
  if (!noValidation.valid) {
    alert(noValidation.message);
    const noInp = document.getElementById('inp-new-patient-no');
    if (noInp) noInp.focus();
    return;
  }
  const hastaNoRaw = noValidation.value;

  // Rutin hasta eklenirken GÜN SEÇİMİ ZORUNLUDUR!
  let selectedDays = [];
  let gunGrubu = 'BUGUN';
  if (basvuruTuru !== 'ACIL_SERVIS') {
    document.querySelectorAll('.chk-new-patient-day').forEach(chk => {
      if (chk.checked) selectedDays.push(chk.value);
    });
    if (selectedDays.length === 0) {
      alert('Lütfen hastanın geleceği seans günlerini seçiniz! Yeni hasta eklerken gün seçimi zorunludur.');
      return;
    }
    const joinedCode = selectedDays.join('_');
    gunGrubu = joinedCode;
    if (joinedCode === 'PZT_CAR_CUM') gunGrubu = 'PZT_CAR_CUM';
    else if (joinedCode === 'SAL_PER_CMT') gunGrubu = 'SAL_PER_CMT';
    else if (selectedDays.length === 6) gunGrubu = 'HER_GUN';
  }

  // Aynı hasta numarasıyla başka bir kayıt var mı kontrol et
  ORACLE_RAW_DATABASE = loadMasterRoster();
  const existingDuplicate = ORACLE_RAW_DATABASE.find(r => String(r.HASTANO).trim() === hastaNoRaw);
  if (existingDuplicate) {
    alert(`Bu Hasta Numarası (${hastaNoRaw}) zaten "${existingDuplicate.HASTAADI}" adına kayıtlıdır! Lütfen hasta numarasını kontrol ediniz.`);
    const noInp = document.getElementById('inp-new-patient-no');
    if (noInp) noInp.focus();
    return;
  }

  const newSeansRefNo = Date.now();
  const customDaysArr = basvuruTuru === 'ACIL_SERVIS' ? null : selectedDays;
  const todayIso = getTodayIsoString();
  const registrationStartIso = currentSelectedDateIso > todayIso ? currentSelectedDateIso : todayIso;
  const newRawRecord = {
    HASTAADI: fullNameRaw,
    HASTANO: hastaNoRaw,
    HASTASEANSREFNO: newSeansRefNo,
    HASTATEDAVIREFNO: 50000 + ORACLE_RAW_DATABASE.length + 1,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30000 + ORACLE_RAW_DATABASE.length + 1,
    HASTAHIZMETREFNO: 40000 + ORACLE_RAW_DATABASE.length + 1,
    SEANSTARIHI: new Date(),
    VARDIYA: vardiya,
    SEANSTURU: 'HEMODIYALIZ',
    SURE: durationVal,
    BASVURUTURU: basvuruTuru,
    MERKEZ: 'Erişkin',
    GUN_GRUBU: gunGrubu,
    OZEL_GUNLER: customDaysArr,
    KAYIT_TARIHI: registrationStartIso,
    ACIL_TARIH: basvuruTuru === 'ACIL_SERVIS' ? currentSelectedDateIso : null,
    STATU: 'BEKLEMEDE',
    YATAKNO: bedNoVal || null,
    HEMODIYALIZ_GECMISI: 50
  };

  // 1. Kalıcı Veritabanı Havuzuna Kaydet
  ORACLE_RAW_DATABASE = loadMasterRoster();
  ORACLE_RAW_DATABASE.push(newRawRecord);
  saveMasterRoster(ORACLE_RAW_DATABASE);

  const formattedDaysLabel = basvuruTuru === 'ACIL_SERVIS'
    ? 'Bugün'
    : formatDayGroupShort(gunGrubu, customDaysArr, false);

  // 2. SADECE hastanın seçilen günleri bugünkü seans günüyle eşleşiyorsa bugünkü ekrana ekle!
  if (doesRowMatchSelectedFilter(newRawRecord)) {
    const mappedSeans = mapOracleRowToActiveSeans(newRawRecord);
    activeSeansList.unshift(mappedSeans);
    renderSecretaryPanel();
    renderTvSlides();
    broadcastSyncState({
      targetSlideIndex: 0,
      playChime: basvuruTuru === 'ACIL_SERVIS',
      toastMessage: basvuruTuru === 'ACIL_SERVIS'
        ? `🚨 Acil Hasta Girişi: ${mappedSeans.maskedName}`
        : `➕ Yeni Hasta Eklendi: ${mappedSeans.maskedName} (${formattedDaysLabel})`
    });
    showToast(
      basvuruTuru === 'ACIL_SERVIS'
        ? `🚨 Acil Hasta (${fullNameRaw}) bugünkü seans listesine ve TV ekranına eklendi.`
        : `✅ ${fullNameRaw} (${formattedDaysLabel}) bugünkü seans listesine ve TV ekranına eklendi.`
    );
  } else {
    // Seçilen günler bugünü içermiyorsa (Örn: Çarşamba günü Pzt-Per hastası eklendiyse) bugünkü ekranda GÖSTERİLMEZ!
    renderDeletePatientModalList();
    showToast(
      `✅ ${fullNameRaw} kaydedildi. Sadece seçilen günlerde (${formattedDaysLabel}) ekranda görünecektir.`
    );
  }

  closeAddPatientModal();

  // 3. Backend Veritabanı Motoruna (database_engine.js) Kaydet
  syncPatientChangeToApi({
    ACTION: 'ADD',
    HASTASEANSREFNO: newSeansRefNo,
    HASTAADI: fullNameRaw,
    HASTANO: hastaNoRaw,
    GUN_GRUBU: gunGrubu,
    VARDIYA: vardiya,
    YATAKNO: bedNoVal,
    SURE: durationVal,
    STATU: newRawRecord.STATU,
    BASVURUTURU: basvuruTuru,
    HEMODIYALIZ_GECMISI: newRawRecord.HEMODIYALIZ_GECMISI
  });
}

// Hasta Silme İşlemi (Hem Ekrandan Hem Veritabanından Kalıcı Olarak Silinir)
function deletePatientById(seansId, skipConfirm = false) {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }

  const target = activeSeansList.find(s => String(s.seansId) === String(seansId));
  const rawTarget = ORACLE_RAW_DATABASE.find(r => String(r.HASTASEANSREFNO) === String(seansId));
  const displayName = target ? `${target.firstName} ${target.lastName} (Hasta No: ${target.tcNo})` : (rawTarget ? `${rawTarget.HASTAADI} (${rawTarget.HASTANO})` : `#${seansId}`);

  if (!skipConfirm) {
    const confirmed = window.confirm(`"${displayName}" isimli hastayı veritabanından ve seans listesinden kalıcı olarak silmek istediğinize emin misiniz?`);
    if (!confirmed) return;
  }

  const targetTc = target ? target.tcNo : (rawTarget ? rawTarget.HASTANO : null);

  // 1. Kalıcı Veritabanı Havuzundan Sil
  ORACLE_RAW_DATABASE = loadMasterRoster().filter(r => {
    if (String(r.HASTASEANSREFNO) === String(seansId)) return false;
    if (targetTc && String(r.HASTANO) === String(targetTc)) return false;
    return true;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  // 2. Aktif Seans Listesinden Sil
  activeSeansList = activeSeansList.filter(s => {
    if (String(s.seansId) === String(seansId)) return false;
    if (targetTc && String(s.tcNo) === String(targetTc)) return false;
    return true;
  });

  renderSecretaryPanel();
  renderTvSlides();
  renderDeletePatientModalList();

  showToast(`🗑️ ${displayName} aktif listeden silindi ve Silinen Hastalar Veritabanına arşivlendi.`);

  broadcastSyncState({
    toastMessage: `🗑️ Hasta kaydı silindi ve arşive kaydedildi.`
  });

  // 3. Backend Veritabanı Motorundan (database_engine.js) Sil ve Ayrı Arşiv Veritabanına Yaz
  syncPatientChangeToApi({
    ACTION: 'DELETE',
    HASTASEANSREFNO: seansId,
    HASTANO: targetTc,
    SILINME_NEDENI: 'Sekreter Tarafından Kalıcı Silindi'
  });
}

let isDeleteSafetyUnlocked = false;
let editingScheduleSeansId = null;

function openDeletePatientModal() {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }
  // Pop-up yerine doğrudan sayfa görünümünü aç
  switchMainView('schedule');
}

function closeDeletePatientModal() {
  switchMainView('patients');
}

function toggleDeleteSafetyLock() {
  const chk = document.getElementById('chk-unlock-delete');
  isDeleteSafetyUnlocked = Boolean(chk && chk.checked);
  renderDeletePatientModalList();
}

// Başka bir gündeki hastayı veritabanından silmeden SADECE BUGÜNKÜ seans ekranına dahil et
function addExistingPatientToToday(seansRefNo) {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }
  ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
    if (String(r.HASTASEANSREFNO) === String(seansRefNo)) {
      return {
        ...r,
        MANUEL_BUGUN_TARIH: currentSelectedDateIso,
        MANUEL_HARIC_TARIH: null
      };
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  const row = ORACLE_RAW_DATABASE.find(r => String(r.HASTASEANSREFNO) === String(seansRefNo));
  if (row && !activeSeansList.some(s => String(s.seansId) === String(seansRefNo))) {
    const mapped = mapOracleRowToActiveSeans(row);
    activeSeansList.unshift(mapped);
  }

  renderSecretaryPanel();
  renderTvSlides();
  renderDeletePatientModalList();

  if (row) {
    showToast(`➕ ${row.HASTAADI} bugünkü (${formatDateTR(currentSelectedDateIso)}) seans listesine eklendi.`);
    broadcastSyncState({
      toastMessage: `➕ ${maskFullName(row.HASTAADI)} bugünkü seansa dahil edildi.`
    });
  }
}

// Bugünkü listede olan bir hastayı veritabanından SİLMEDEN sadece bugünkü ekrandan çıkar (farklı gün gelecekse)
function removePatientFromTodayOnly(seansRefNo) {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }
  ORACLE_RAW_DATABASE = loadMasterRoster().map(r => {
    if (String(r.HASTASEANSREFNO) === String(seansRefNo)) {
      return {
        ...r,
        MANUEL_BUGUN_TARIH: null,
        MANUEL_HARIC_TARIH: currentSelectedDateIso
      };
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  const row = ORACLE_RAW_DATABASE.find(r => String(r.HASTASEANSREFNO) === String(seansRefNo));
  activeSeansList = activeSeansList.filter(s => String(s.seansId) !== String(seansRefNo));

  renderSecretaryPanel();
  renderTvSlides();
  renderDeletePatientModalList();

  if (row) {
    showToast(`📅 ${row.HASTAADI} veritabanından silinmeden sadece bugünkü listeden çıkarıldı.`);
    broadcastSyncState({
      toastMessage: `📅 Liste güncellendi.`
    });
  }
}

function renderDeletePatientModalList() {
  const listEl = document.getElementById('delete-patient-modal-list');
  if (!listEl) return;

  ORACLE_RAW_DATABASE = loadMasterRoster().slice().sort(comparePatientsByPriority);
  if (ORACLE_RAW_DATABASE.length === 0) {
    listEl.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">Veritabanında kayıtlı hasta bulunmamaktadır.</div>`;
    return;
  }

  listEl.innerHTML = ORACLE_RAW_DATABASE.map(r => {
    const isEmergencyRow = r.BASVURUTURU === 'ACIL_SERVIS' || r.GUN_GRUBU === 'BUGUN';
    const grpLabel = formatDayGroupShort(r.GUN_GRUBU, r.OZEL_GUNLER, isEmergencyRow);
    const isInTodayList = activeSeansList.some(s => String(s.seansId) === String(r.HASTASEANSREFNO));

    return `
      <div class="delete-patient-row">
        <div style="min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 700; font-size: 13.5px; color: #0f172a;">${r.HASTAADI}</span>
            ${isInTodayList
        ? `<span style="font-size: 10px; font-weight: 700; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 1px 7px; border-radius: 99px;">Bugün Aktif</span>`
        : `<span style="font-size: 10px; font-weight: 700; background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; padding: 1px 7px; border-radius: 99px;">Diğer Gün</span>`
      }
          </div>
          <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;">
            No: <strong style="color: #334155;">${r.HASTANO}</strong> • Yatak: <strong style="color: #334155;">${r.YATAKNO || '-'}</strong> • Gün: <strong style="color: ${isEmergencyRow ? '#ea580c' : '#0284c7'};">${grpLabel}</strong>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          ${isInTodayList
        ? `<button type="button" class="btn-row-action btn-row-remove-today" onclick="removePatientFromTodayOnly(${r.HASTASEANSREFNO})" title="Hastayı veritabanından silmeden sadece bugünkü ekrandan çıkar">
                ➖ Bugün Gelmeyecek
              </button>`
        : `<button type="button" class="btn-row-action btn-row-add-today" onclick="addExistingPatientToToday(${r.HASTASEANSREFNO})" title="Bu hastayı bugünkü seans ekranına dahil et">
                ➕ Bugüne Ekle
              </button>`
      }
          <button type="button" class="btn-row-action btn-row-edit-day" onclick="openPatientScheduleModal(${r.HASTASEANSREFNO})" title="Seans günlerini düzenle">
            ${isEmergencyRow ? 'Detay' : '📅 Gün Değiştir'}
          </button>
          ${isDeleteSafetyUnlocked ? `
            <button type="button" class="btn-row-action btn-row-delete-safe" onclick="deletePatientById(${r.HASTASEANSREFNO})" title="Kalıcı Olarak Sil">
              🗑️ Sil
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// HASTA DETAY POP-UP MODALI (Hastanın Adına Tıklandığında Açılır)
// Yatak No, Diyaliz Süresi Uzatma ve Manuel Gün Seçimi burada yer alır
// ============================================================================
function updateDetailModalTimeSummary(seansRefNo) {
  const timeTextEl = document.getElementById('detail-modal-time-text');
  if (!timeTextEl) return;

  const activeItem = activeSeansList.find(s => String(s.seansId) === String(seansRefNo));
  const row = ORACLE_RAW_DATABASE.find(r => String(r.HASTASEANSREFNO) === String(seansRefNo));
  const plannedMin = activeItem ? (activeItem.plannedDurationMinutes || 145) : (row ? (row.SURE || 145) : 145);

  if (activeItem && activeItem.countdownEndsAt) {
    const estEnd = formatEstimatedEndTime(activeItem.countdownEndsAt);
    timeTextEl.innerHTML = `⏱ Kalan: ${formatRemainingTime(activeItem.countdownEndsAt)} • 🏁 Bitiş: ${estEnd}`;
  } else {
    timeTextEl.innerHTML = `⏱ Planlanan: ${formatDurationLabel(plannedMin)} (${plannedMin} dk)`;
  }
}

function adjustDetailModalTime(deltaMinutes) {
  if (!editingScheduleSeansId) return;
  extendPatientSessionTime(Number(editingScheduleSeansId), deltaMinutes);
  updateDetailModalTimeSummary(editingScheduleSeansId);
}

function openPatientScheduleModal(seansRefNo) {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }
  editingScheduleSeansId = seansRefNo;
  ORACLE_RAW_DATABASE = loadMasterRoster();
  const row = ORACLE_RAW_DATABASE.find(r => String(r.HASTASEANSREFNO) === String(seansRefNo));
  const activeItem = activeSeansList.find(s => String(s.seansId) === String(seansRefNo));
  if (!row && !activeItem) return;

  const patientName = row ? row.HASTAADI : `${activeItem.firstName} ${activeItem.lastName}`;
  const patientNo = row ? row.HASTANO : activeItem.tcNo;
  const rawGroup = row ? row.GUN_GRUBU : activeItem.gunGrubu;
  const isEmergency = (row ? row.BASVURUTURU : activeItem.gelisTipi) === 'ACIL_SERVIS' || rawGroup === 'BUGUN';
  const bedNo = (activeItem ? activeItem.bedNo : (row ? row.YATAKNO : 1)) || 1;
  const currentDays = isEmergency
    ? []
    : getPatientDaysArray(rawGroup, row ? row.OZEL_GUNLER : activeItem.ozelGunler);

  const nameEl = document.getElementById('schedule-modal-patient-name');
  if (nameEl) nameEl.textContent = patientName;

  const nameInp = document.getElementById('detail-modal-patient-name-input');
  if (nameInp) nameInp.value = patientName;

  const subEl = document.getElementById('schedule-modal-patient-sub');
  if (subEl) {
    subEl.textContent = `Hasta No: ${patientNo} • 📅 ${isEmergency ? 'Bugün' : formatDayGroupShort(rawGroup, currentDays, false)}`;
  }

  const detailNoInp = document.getElementById('detail-modal-patient-no');
  if (detailNoInp) {
    detailNoInp.value = String(patientNo || '').replace(/[^0-9]/g, '').slice(0, 8);
  }

  const badgeEl = document.getElementById('schedule-modal-status-badge');
  if (badgeEl) {
    badgeEl.className = `status-badge-mini ${activeItem ? activeItem.badgeClass : 'badge-blue'}`;
    badgeEl.textContent = activeItem ? activeItem.statusText : 'Kayıtlı';
  }

  const bedSel = document.getElementById('detail-modal-bed-select');
  if (bedSel) populateDynamicBedSelect(bedSel, bedNo);

  const shiftBox = document.getElementById('detail-modal-shift-box');
  const shiftSel = document.getElementById('detail-modal-shift-select');
  const currentVardiya = String((activeItem ? activeItem.vardiya : (row ? row.VARDIYA : 'SABAH')) || '').toLocaleUpperCase('tr-TR');
  if (isEmergency) {
    if (shiftBox) shiftBox.style.display = 'none';
  } else {
    if (shiftBox) shiftBox.style.display = 'block';
    if (shiftSel) {
      if (currentVardiya === 'SABAH') shiftSel.value = 'SABAH';
      else if (currentVardiya === 'OGLEN' || currentVardiya === 'ÖĞLEN' || currentVardiya === 'OGLE') shiftSel.value = 'OGLEN';
      else shiftSel.value = 'BELIRTILMEMIS';
    }
  }

  updateDetailModalTimeSummary(seansRefNo);

  // Acilden gelen hastalara gün girilmez, sadece "Bugün" kutusu gösterilir
  const daysSection = document.getElementById('detail-modal-days-section');
  const emergencyDayBox = document.getElementById('detail-modal-emergency-day-box');
  if (isEmergency) {
    if (daysSection) daysSection.style.display = 'none';
    if (emergencyDayBox) emergencyDayBox.style.display = 'block';
  } else {
    if (daysSection) daysSection.style.display = 'block';
    if (emergencyDayBox) emergencyDayBox.style.display = 'none';
    document.querySelectorAll('.chk-custom-day').forEach(chk => {
      chk.checked = currentDays.includes(chk.value);
    });
  }

  const modal = document.getElementById('patient-schedule-modal');
  if (modal) modal.classList.add('active');
}

function closePatientScheduleModal() {
  const modal = document.getElementById('patient-schedule-modal');
  if (modal) modal.classList.remove('active');
  editingScheduleSeansId = null;
}

function savePatientCustomSchedule() {
  if (!editingScheduleSeansId) return;

  ORACLE_RAW_DATABASE = loadMasterRoster();
  const existingRow = ORACLE_RAW_DATABASE.find(r => String(r.HASTASEANSREFNO) === String(editingScheduleSeansId));
  const activeItem = activeSeansList.find(s => String(s.seansId) === String(editingScheduleSeansId));
  const rawGroup = existingRow ? existingRow.GUN_GRUBU : (activeItem ? activeItem.gunGrubu : '');
  const isEmergency = (existingRow ? existingRow.BASVURUTURU : (activeItem ? activeItem.gelisTipi : '')) === 'ACIL_SERVIS'
    || rawGroup === 'BUGUN';

  const nameInp = document.getElementById('detail-modal-patient-name-input');
  const rawEditedName = nameInp
    ? nameInp.value.trim().toLocaleUpperCase('tr-TR')
    : (existingRow ? existingRow.HASTAADI : (activeItem ? `${activeItem.firstName} ${activeItem.lastName}`.trim() : ''));
  if (!rawEditedName) {
    alert('Lütfen hastanın adını ve soyadını boş bırakmayınız!');
    if (nameInp) nameInp.focus();
    return;
  }

  const rawEditedNo = document.getElementById('detail-modal-patient-no')
    ? document.getElementById('detail-modal-patient-no').value
    : (existingRow ? existingRow.HASTANO : (activeItem ? activeItem.tcNo : ''));
  const noCheck = validateHastaNo(rawEditedNo);
  if (!noCheck.valid) {
    alert(noCheck.message);
    const detailNoInp = document.getElementById('detail-modal-patient-no');
    if (detailNoInp) detailNoInp.focus();
    return;
  }
  const newHastaNo = noCheck.value;

  const duplicateOther = ORACLE_RAW_DATABASE.find(
    r => String(r.HASTASEANSREFNO) !== String(editingScheduleSeansId) && String(r.HASTANO).trim() === newHastaNo
  );
  if (duplicateOther) {
    alert(`Bu Hasta Numarası (${newHastaNo}) zaten "${duplicateOther.HASTAADI}" adına kayıtlıdır!`);
    const detailNoInp = document.getElementById('detail-modal-patient-no');
    if (detailNoInp) detailNoInp.focus();
    return;
  }

  const newBedNo = parseInt(document.getElementById('detail-modal-bed-select')?.value || '1', 10);
  const newShiftVal = isEmergency
    ? 'ACİL'
    : (document.getElementById('detail-modal-shift-select')?.value || 'SABAH');

  let newGroupCode = 'BUGUN';
  let selectedDays = null;

  if (!isEmergency) {
    selectedDays = [];
    document.querySelectorAll('.chk-custom-day').forEach(chk => {
      if (chk.checked) selectedDays.push(chk.value);
    });

    if (selectedDays.length === 0) {
      alert('Lütfen hastanın geleceği en az 1 gün seçiniz.');
      return;
    }

    const joinedCode = selectedDays.join('_');
    newGroupCode = joinedCode;
    if (joinedCode === 'PZT_CAR_CUM') newGroupCode = 'PZT_CAR_CUM';
    else if (joinedCode === 'SAL_PER_CMT') newGroupCode = 'SAL_PER_CMT';
    else if (selectedDays.length === 6) newGroupCode = 'HER_GUN';
  }

  // 1. Kalıcı veritabanı kaydını güncelle (Ad Soyad, Hasta No, Vardiya, Yatak, Günler)
  let updatedName = rawEditedName;
  let updatedRowObj = null;
  ORACLE_RAW_DATABASE = ORACLE_RAW_DATABASE.map(r => {
    if (String(r.HASTASEANSREFNO) === String(editingScheduleSeansId)) {
      updatedRowObj = {
        ...r,
        HASTAADI: rawEditedName,
        HASTANO: newHastaNo,
        YATAKNO: newBedNo,
        VARDIYA: newShiftVal,
        GUN_GRUBU: isEmergency ? 'BUGUN' : newGroupCode,
        OZEL_GUNLER: isEmergency ? null : selectedDays
      };
      return updatedRowObj;
    }
    return r;
  });
  saveMasterRoster(ORACLE_RAW_DATABASE);

  // Backend Veritabanı Motoruna (database_engine.js -> diyaliz_database.json & diyaliz_oracle_db.sql) Kaydet
  syncPatientChangeToApi({
    ACTION: 'UPDATE',
    HASTASEANSREFNO: editingScheduleSeansId,
    HASTAADI: rawEditedName,
    HASTANO: newHastaNo,
    YATAKNO: newBedNo,
    VARDIYA: newShiftVal,
    GUN_GRUBU: isEmergency ? 'BUGUN' : newGroupCode,
    OZEL_GUNLER: isEmergency ? null : selectedDays
  });

  // 2. Hastanın yeni günleri bugünkü seans tarihiyle eşleşiyor mu kontrol et:
  // Eşleşmiyorsa (Örn: Çarşamba günü hastanın günleri Pzt - Per yapıldıysa) bugünkü ekrandan anında kaldır!
  const matchesToday = updatedRowObj ? doesRowMatchSelectedFilter(updatedRowObj) : true;
  if (!matchesToday) {
    activeSeansList = activeSeansList.filter(p => String(p.seansId) !== String(editingScheduleSeansId));
  } else {
    const alreadyInActive = activeSeansList.some(p => String(p.seansId) === String(editingScheduleSeansId));
    const nameParts = rawEditedName.split(/\s+/).filter(Boolean);
    const newFirstName = nameParts[0] || '';
    const newLastName = nameParts.slice(1).join(' ') || '';
    const newMaskedName = maskFullName(rawEditedName);

    if (alreadyInActive) {
      activeSeansList.forEach(p => {
        if (String(p.seansId) === String(editingScheduleSeansId)) {
          p.firstName = newFirstName;
          p.lastName = newLastName;
          p.maskedName = newMaskedName;
          p.tcNo = newHastaNo;
          p.bedNo = newBedNo;
          p.vardiya = newShiftVal;
          p.gunGrubu = isEmergency ? 'BUGUN' : newGroupCode;
          p.ozelGunler = isEmergency ? null : selectedDays;
        }
      });
    } else if (updatedRowObj) {
      activeSeansList.unshift(mapOracleRowToActiveSeans(updatedRowObj));
    }
  }
  sortActiveSeansList();

  const formattedDays = isEmergency ? 'Bugün' : formatDayGroupShort(newGroupCode, selectedDays, false);
  closePatientScheduleModal();
  renderSecretaryPanel();
  renderTvSlides();
  renderDeletePatientModalList();

  showToast(
    matchesToday
      ? `✅ ${updatedName || 'Hasta'} detayları güncellendi (Yatak ${newBedNo} • ${formattedDays}).`
      : `✅ ${updatedName || 'Hasta'} sadece (${formattedDays}) günlerine alındı ve bugünkü listeden çıkarıldı.`
  );
  broadcastSyncState({
    toastMessage: `🔄 Hasta detayları güncellendi (${formattedDays}).`
  });
}

function resetMasterRosterToDefaults() {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }
  if (!window.confirm('Varsayılan Pazartesi-Çarşamba-Cuma (8 Hasta) ve Salı-Perşembe-Cumartesi (9 Hasta) olmak üzere toplam 17 hastayı veritabanına geri yüklemek istediğinize emin misiniz?')) {
    return;
  }
  const initial = DEFAULT_ORACLE_RAW_DATABASE.map(r => ({ ...r }));
  saveMasterRoster(initial);
  ORACLE_RAW_DATABASE = initial;
  executeDailyOracleQuery(true);
  renderDeletePatientModalList();
  fetch(resolveApiUrl('/api/reset'), { method: 'POST' }).catch(() => { });
  showToast('✅ Varsayılan 17 hasta (Pzt-Çar-Cum & Sal-Per-Cmt) veritabanına geri yüklendi.');
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => { });
  } else {
    document.exitFullscreen().catch(() => { });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // URL parametresi veya body attribute'una göre başlangıç ekran modunu belirle
  const urlParams = new URLSearchParams(window.location.search);
  const paramMode = urlParams.get('ekran') || urlParams.get('mode');
  const bodyMode = document.body.getAttribute('data-screen-mode');

  // TV Ünitesi Seçimi: ?tv=1, ?tv=2, ?tv=3
  const tvParam = urlParams.get('tv') || urlParams.get('unite');
  if (tvParam && ['1', '2', '3'].includes(tvParam)) {
    selectedTvUnitParam = tvParam;
  }

  if (paramMode === 'display' || paramMode === 'bekleme' || paramMode === 'tv' || selectedTvUnitParam) {
    switchScreenMode('display');
  } else if (paramMode === 'secretary' || paramMode === 'sekreter') {
    switchScreenMode('secretary');
  } else if (bodyMode === 'display' || bodyMode === 'secretary') {
    switchScreenMode(bodyMode);
  } else {
    switchScreenMode('secretary');
  }

  startClock();
  checkAuthStatus(); // Sekreter oturumunu kontrol et
  updateCalendarInfoBar(); // Takvim ve gün grubu çubuğunu başlat
  executeDailyOracleQuery(false); // Kalıcı takvim hastalarını ve seanslarını yükle
  startMultiYearCalendarAutoRefresh(); // Yıllarca çalışan otomatik gün/takvim kontrolünü başlat
  startSlideAutomation();

  const searchInput = document.getElementById('secretary-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      secretarySearchTerm = e.target.value.trim();
      renderSecretaryPanel();
    });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderTvSlides();
    }, 200);
  });

  document.body.addEventListener('click', () => {
    initAudioContext();
  }, { once: true });
});
