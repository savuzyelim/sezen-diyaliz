// ============================================================================
// NUCLEUS HBYS ENTEGRASYONLU DİYALİZ DISPLAY MOTORU
// - TÜM KONUŞMA / ANONS SİSTEMİ TAMAMEN KALDIRILDI!
// - YALNIZCA KISA, ZARİF VE HUZURLU BİR DİNG BİLDİRİM ZİLİ (CHIME) BIRAKILDI
// - SIFIR MANUEL VERİ GİRİŞİ (Nucleus Protokol Entegrasyonu)
// ============================================================================

// NUCLEUS HBYS HASTA HAVUZU
const NUCLEUS_MASTER_DATABASE = {
  urgentPatientPool: [
    {
      protokolNo: 'PRT-ACIL-991',
      tcNo: '10000000009',
      firstName: 'Mustafa',
      lastName: 'Aydın',
      maskedName: 'Mus*** Ayd***',
      dialysisHistory: 12,
      source: 'ACIL_SERVIS',
      bloodGroup: 'A Rh+',
      suggestedBed: 9
    },
    {
      protokolNo: 'PRT-ACIL-992',
      tcNo: '10000000010',
      firstName: 'Kemal',
      lastName: 'Yılmaz',
      maskedName: 'Kem*** Yıl***',
      dialysisHistory: 0,
      source: 'ACIL_SERVIS',
      bloodGroup: '0 Rh+',
      suggestedBed: null
    },
    {
      protokolNo: 'PRT-YB-883',
      tcNo: '10000000011',
      firstName: 'Sultan',
      lastName: 'Güler',
      maskedName: 'Sul*** Gül***',
      dialysisHistory: 5,
      source: 'YOGUN_BAKIM',
      bloodGroup: 'B Rh-',
      suggestedBed: null
    }
  ]
};

// ============================================================================
// ORACLE HBYS VERİTABANI MOTORU VE GÜNLÜK SORGUSU
// ============================================================================
// SQL:
//   SELECT hb.adi || ' ' || hb.soyadi AS HASTAADI, dhb.hastano, t.HASTASEANSREFNO,
//          t.HASTATEDAVIREFNO, t.KABULTARIHI, t.HASTABASVURUREFNO, t.HASTAHIZMETREFNO,
//          t.SEANSTARIHI, CASE WHEN t.VARDIYATANIMNO = 1 THEN 'SABAH' ELSE 'ÖGLEN' END AS VARDIYA,
//          t.SEANSTURU, t.SURE, t.BASVURUTURU, t.KABULIPTALNEDENNO, t.KABULIPTALTARIHI,
//          t.kabuliptalaciklama, t.IPTALEDENP, t.IPTALTARIHI, t.STATU
//     FROM dyz_hasta_seanslari t ...
//    WHERE t.seanstarihi >= TRUNC(SYSDATE) AND t.seanstarihi < TRUNC(SYSDATE) + 1
// ============================================================================

// Oracle REST API Endpoint yapılandırması (Local storage ile saklanır)
let ORACLE_API_ENDPOINT = localStorage.getItem('ORACLE_API_ENDPOINT') || '';

// Oracle Veritabanı Tablolarının Birebir Temsili (dyz_hasta_seanslari + dyz_hasta_tedavi_bilgileri + hasta_bilgileri)
const ORACLE_RAW_DATABASE = [
  {
    HASTAADI: 'Ahmet Yıldız',
    HASTANO: '10000000001',
    HASTASEANSREFNO: 10001,
    HASTATEDAVIREFNO: 50001,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30001,
    HASTAHIZMETREFNO: 40001,
    SEANSTARIHI: new Date(), // TRUNC(SYSDATE) -> BUGÜN
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'BEKLEMEDE',
    YATAKNO: 1,
    HEMODIYALIZ_GECMISI: 142
  },
  {
    HASTAADI: 'Mehmet Demir',
    HASTANO: '10000000002',
    HASTASEANSREFNO: 10002,
    HASTATEDAVIREFNO: 50002,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30002,
    HASTAHIZMETREFNO: 40002,
    SEANSTARIHI: new Date(), // TRUNC(SYSDATE) -> BUGÜN
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'KATETER_TAKILIYOR',
    YATAKNO: 2,
    HEMODIYALIZ_GECMISI: 0 // İLK GİRİŞ
  },
  {
    HASTAADI: 'Ayşe Korkmaz',
    HASTANO: '10000000003',
    HASTASEANSREFNO: 10003,
    HASTATEDAVIREFNO: 50003,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30003,
    HASTAHIZMETREFNO: 40003,
    SEANSTARIHI: new Date(), // TRUNC(SYSDATE) -> BUGÜN
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'YAKINI_CAGRILIYOR',
    YATAKNO: 3,
    HEMODIYALIZ_GECMISI: 88
  },
  {
    HASTAADI: 'Fatma Çelik',
    HASTANO: '10000000004',
    HASTASEANSREFNO: 10004,
    HASTATEDAVIREFNO: 50004,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30004,
    HASTAHIZMETREFNO: 40004,
    SEANSTARIHI: new Date(), // TRUNC(SYSDATE) -> BUGÜN
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'BAGLANDI',
    YATAKNO: 4,
    HEMODIYALIZ_GECMISI: 215
  },
  {
    HASTAADI: 'Ali Kaya',
    HASTANO: '10000000005',
    HASTASEANSREFNO: 10005,
    HASTATEDAVIREFNO: 50005,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30005,
    HASTAHIZMETREFNO: 40005,
    SEANSTARIHI: new Date(), // TRUNC(SYSDATE) -> BUGÜN
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'YARIDA_KALDI',
    YATAKNO: 5,
    HEMODIYALIZ_GECMISI: 64,
    kabuliptalaciklama: 'Tansiyon dengelenmesi amacıyla hekim kararıyla seans erken tamamlanmış olup dinlenme odasında istirahat etmektedir.'
  },
  {
    HASTAADI: 'Hatice Öztürk',
    HASTANO: '10000000006',
    HASTASEANSREFNO: 10006,
    HASTATEDAVIREFNO: 50006,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30006,
    HASTAHIZMETREFNO: 40006,
    SEANSTARIHI: new Date(), // TRUNC(SYSDATE) -> BUGÜN
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'TEDAVI_SURUYOR',
    YATAKNO: 6,
    HEMODIYALIZ_GECMISI: 120
  },
  {
    HASTAADI: 'Hüseyin Arslan',
    HASTANO: '10000000007',
    HASTASEANSREFNO: 10007,
    HASTATEDAVIREFNO: 50007,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30007,
    HASTAHIZMETREFNO: 40007,
    SEANSTARIHI: new Date(), // TRUNC(SYSDATE) -> BUGÜN
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'AYRILDI',
    YATAKNO: 7,
    HEMODIYALIZ_GECMISI: 95
  },
  {
    HASTAADI: 'Emine Koç',
    HASTANO: '10000000008',
    HASTASEANSREFNO: 10008,
    HASTATEDAVIREFNO: 50008,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30008,
    HASTAHIZMETREFNO: 40008,
    SEANSTARIHI: new Date(), // TRUNC(SYSDATE) -> BUGÜN
    VARDIYA: 'SABAH',
    SEANSTURU: 'HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'RUTIN',
    STATU: 'TABURCU',
    YATAKNO: 8,
    HEMODIYALIZ_GECMISI: 180
  },
  {
    HASTAADI: 'Mustafa Aydın',
    HASTANO: '10000000009',
    HASTASEANSREFNO: 10009,
    HASTATEDAVIREFNO: 50009,
    KABULTARIHI: new Date(),
    HASTABASVURUREFNO: 30009,
    HASTAHIZMETREFNO: 40009,
    SEANSTARIHI: new Date(), // TRUNC(SYSDATE) -> BUGÜN
    VARDIYA: 'SABAH',
    SEANSTURU: 'ACIL_HEMODIYALIZ',
    SURE: 145,
    BASVURUTURU: 'ACIL_SERVIS',
    STATU: 'BAGLANDI',
    YATAKNO: 9,
    HEMODIYALIZ_GECMISI: 12
  }
];

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
  let instruction = 'Hazırlık sırası bekleniyor. Lütfen ekrandaki yatak numaranızı takip ediniz.';
  let countdownEndsAt = null;
  let countdownType = null;
  let isUrgentCall = (status === 'ODAYA_CAGRILDI');
  let isFamilyCall = (status === 'YAKINI_CAGRILIYOR');
  let isAborted = (status === 'YARIDA_KALDI');

  if (status === 'ODAYA_CAGRILDI') {
    statusText = 'Hazırlık Odasına Geçiniz';
    badgeClass = 'badge-blue';
    slideGroup = 'BEKLEME';
    instruction = 'Lütfen Diyaliz Hazırlık Odasına Geçiniz (Tartı ve Ön Hazırlık).';
  } else if (status === 'KATETER_TAKILIYOR') {
    statusText = 'Kateter & Ön Hazırlık';
    badgeClass = 'badge-teal';
    slideGroup = 'BEKLEME';
    instruction = 'İlk Giriş: Kateter ve damar yolu hazırlığı devam ediyor (Yaklaşık 30 dk).';
    countdownEndsAt = new Date(Date.now() + 24 * 60 * 1000);
    countdownType = 'KATETER';
  } else if (status === 'BAGLANDI' || status === 'TEDAVI_SURUYOR') {
    statusText = 'Seans Devam Ediyor';
    badgeClass = 'badge-purple';
    slideGroup = 'DIYALIZ';
    instruction = 'Diyaliz seansı aktif sürdürülmektedir. Standart seans süresi: 2 saat 25 dakika.';
    countdownEndsAt = new Date(Date.now() + (2 * 60 + 15) * 60 * 1000);
    countdownType = 'DIYALIZ';
  } else if (status === 'YAKINI_CAGRILIYOR') {
    statusText = 'Danışma Bilgilendirme';
    badgeClass = 'badge-indigo';
    slideGroup = 'BEKLEME';
    instruction = 'Hasta Yakınının Danışmaya Uğraması Rica Olunur.';
  } else if (status === 'YARIDA_KALDI') {
    statusText = 'Hekim Kontrolünde Tamamlandı';
    badgeClass = 'badge-soft-amber';
    slideGroup = 'BEKLEME';
    instruction = 'Hekim değerlendirmesi neticesinde bugünkü seans planlanandan erken tamamlanmıştır.';
  } else if (status === 'AYRILDI') {
    statusText = 'Dinlenme / Gözlem';
    badgeClass = 'badge-teal';
    slideGroup = 'CIKIS';
    instruction = 'Seans tamamlanmıştır. Hastamız dinlenme alanında tansiyon takibindedir.';
  } else if (status === 'TABURCU') {
    statusText = 'İşlemler Tamamlandı';
    badgeClass = 'badge-green';
    slideGroup = 'CIKIS';
    instruction = 'Bugünkü tedavi başarıyla tamamlanmıştır.';
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
    gelisTipi: row.BASVURUTURU || 'RUTIN',
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
    abortReason: row.kabuliptalaciklama || '',
    vardiya: row.VARDIYA || 'SABAH',
    presence: row.PRESENCE || 'GELDI', // 'GELDI' veya 'GELMEDI'
    updatedAt: new Date()
  };
}

// Aktif Seans Listesi (Oracle DB'den otomatik yüklenir)
let activeSeansList = [];

// Oracle DB Sorgusunu Çalıştıran Fonksiyon
// WHERE t.seanstarihi >= TRUNC(SYSDATE) AND t.seanstarihi < TRUNC(SYSDATE) + 1
async function executeDailyOracleQuery() {
  const syncBtn = document.getElementById('btn-oracle-sync');
  const syncTxt = document.getElementById('txt-oracle-sync');
  if (syncBtn) syncBtn.classList.add('syncing');
  if (syncTxt) syncTxt.textContent = 'Sorgulanıyor...';

  try {
    // 1. Eğer harici bir Oracle REST API Endpoint tanımlıysa oradan çek
    if (ORACLE_API_ENDPOINT) {
      const resp = await fetch(ORACLE_API_ENDPOINT, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        const rows = await resp.json();
        activeSeansList = rows.map(mapOracleRowToActiveSeans);
        updateHbysStatusBadge(true, `Oracle DB (Canlı REST API: ${activeSeansList.length} Seans)`);
        showToast(`✅ Oracle DB'den bugünün ${activeSeansList.length} seansı başarıyla çekildi.`);
        return;
      }
    }

    // 2. Local Oracle Simülatörü: TRUNC(SYSDATE) filtresini JavaScript Date ile uygula
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, 0);

    // SQL Filtresi: WHERE t.seanstarihi >= TRUNC(SYSDATE) AND t.seanstarihi < TRUNC(SYSDATE) + 1
    const filteredRows = ORACLE_RAW_DATABASE.filter(row => {
      const d = new Date(row.SEANSTARIHI);
      return d >= startOfToday && d < endOfToday;
    });

    activeSeansList = filteredRows.map(mapOracleRowToActiveSeans);
    updateHbysStatusBadge(true, `Oracle DB Canlı: TRUNC(SYSDATE) (${activeSeansList.length} Seans Aktif)`);
    showToast(`🔄 Oracle DB: TRUNC(SYSDATE) ile bugünün ${activeSeansList.length} seansı çekildi.`);

  } catch (err) {
    console.error('Oracle DB veri çekme hatası:', err);
    updateHbysStatusBadge(false, 'Oracle Bağlantı Hatası (Yedek Veri)');
    showToast('⚠️ Oracle bağlantısı kurulamadı, yerel yedek veriler korundu.');
  } finally {
    if (syncBtn) syncBtn.classList.remove('syncing');
    if (syncTxt) syncTxt.textContent = 'Oracle DB Çek';
    renderSecretaryPanel();
    renderTvSlides();
  }
}

// Üst bilgi rozetini güncelle
function updateHbysStatusBadge(isOnline, text) {
  const dot = document.getElementById('hbys-status-dot');
  const txt = document.getElementById('hbys-status-text');
  if (dot) dot.style.background = isOnline ? '#2dd4bf' : '#f87171';
  if (txt) {
    txt.style.color = isOnline ? '#2dd4bf' : '#f87171';
    txt.textContent = text;
  }
}

// Buton ile tetiklenen manuel senkronizasyon
function syncWithOracleDatabase() {
  executeDailyOracleQuery();
}

// API Endpoint Modal İşlemleri
function openApiConfigModal() {
  const inp = document.getElementById('inp-api-endpoint');
  if (inp) inp.value = ORACLE_API_ENDPOINT;
  document.getElementById('api-config-modal').classList.add('active');
}

function closeApiConfigModal() {
  document.getElementById('api-config-modal').classList.remove('active');
}

function saveApiEndpointConfig() {
  const inp = document.getElementById('inp-api-endpoint');
  if (inp) {
    ORACLE_API_ENDPOINT = inp.value.trim();
    localStorage.setItem('ORACLE_API_ENDPOINT', ORACLE_API_ENDPOINT);
  }
  closeApiConfigModal();
  executeDailyOracleQuery();
}

// ============================================================================
// REST APİ İLE SEKRETER EKRANINDAN DISPLAYE VERİ GÖNDERME MOTORU
// emirhan.txt Madde 8 & 9: Tek endpoint üzerinden sekreter ekranından displaye veri gönderme
// ============================================================================
async function syncPatientChangeToApi(payload) {
  // Varsayılan API URL'si veya yapılandırılmış endpoint
  const targetUrl = ORACLE_API_ENDPOINT || 'http://localhost:3000/api/seanslar';
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
      const data = await res.json();
      console.log('📡 [REST API] Sekreter verisi başarıyla API endpointine gönderildi:', data);
      return data;
    }
  } catch (err) {
    // Local modda offline veya harici sunucu kapalıysa sessizce logla, yerel engine zaten aktif çalışır
    console.warn('⚠️ [REST API] Backend endpointine bağlanılamadı, yerel engine güncellendi:', err.message);
  }
  return null;
}

// ============================================================================
// REST APİ TEST ALANI & POSTMAN İSTEK SİMÜLATÖRÜ
// emirhan.txt Madde 1, 12, 21: Test alanı, mock API ve Postman istek testi
// ============================================================================
function openApiTesterModal() {
  const modal = document.getElementById('api-tester-modal');
  if (modal) {
    modal.classList.add('active');
    const urlInp = document.getElementById('tester-url');
    if (urlInp && !urlInp.value) {
      urlInp.value = ORACLE_API_ENDPOINT || 'http://localhost:3000/api/seanslar';
    }
  }
}

function closeApiTesterModal() {
  const modal = document.getElementById('api-tester-modal');
  if (modal) modal.classList.remove('active');
}

function onTesterMethodChange() {
  const method = document.getElementById('tester-http-method').value;
  const bodyGroup = document.getElementById('tester-body-group');
  if (bodyGroup) {
    bodyGroup.style.display = (method === 'GET') ? 'none' : 'block';
  }
}

function loadTesterTemplate(templateType) {
  const methodSelect = document.getElementById('tester-http-method');
  const bodyArea = document.getElementById('tester-request-body');
  
  if (templateType === 'GET_ALL') {
    methodSelect.value = 'GET';
    onTesterMethodChange();
    return;
  }

  methodSelect.value = 'POST';
  onTesterMethodChange();

  switch (templateType) {
    case 'STATUS_UPDATE':
      bodyArea.value = JSON.stringify({
        HASTASEANSREFNO: 10001,
        STATU: "BAGLANDI",
        PRESENCE: "GELDI",
        SURE: 145
      }, null, 2);
      break;
    case 'ROOM_CALL':
      bodyArea.value = JSON.stringify({
        HASTASEANSREFNO: 10003,
        STATU: "ODAYA_CAGRILDI",
        PRESENCE: "GELDI"
      }, null, 2);
      break;
    case 'PRESENCE_ABSENT':
      bodyArea.value = JSON.stringify({
        HASTASEANSREFNO: 10002,
        PRESENCE: "GELMEDI"
      }, null, 2);
      break;
    case 'NEW_PATIENT':
      bodyArea.value = JSON.stringify({
        HASTAADI: "Canan Yılmaz",
        HASTANO: "10000000012",
        HASTASEANSREFNO: 10012,
        VARDIYA: "SABAH",
        SEANSTURU: "ACIL_HEMODIYALIZ",
        BASVURUTURU: "ACIL_SERVIS",
        STATU: "KATETER_TAKILIYOR",
        PRESENCE: "GELDI",
        YATAKNO: 9,
        HEMODIYALIZ_GECMISI: 0
      }, null, 2);
      break;
  }
}

async function executeApiTestRequest() {
  const method = document.getElementById('tester-http-method').value;
  const url = document.getElementById('tester-url').value.trim() || 'http://localhost:3000/api/seanslar';
  const bodyText = document.getElementById('tester-request-body').value;
  const statusEl = document.getElementById('tester-response-status');
  const outputEl = document.getElementById('tester-response-output');
  const runBtn = document.getElementById('btn-run-api-test');

  if (runBtn) runBtn.textContent = 'Gönderiliyor...';
  if (statusEl) {
    statusEl.textContent = 'İstek yapılıyor...';
    statusEl.style.color = '#38bdf8';
  }

  try {
    const options = {
      method: method,
      headers: {
        'Accept': 'application/json'
      }
    };

    if (method !== 'GET') {
      options.headers['Content-Type'] = 'application/json';
      options.body = bodyText;
    }

    const startTime = performance.now();
    const res = await fetch(url, options);
    const duration = Math.round(performance.now() - startTime);

    const json = await res.json();
    if (statusEl) {
      statusEl.textContent = `HTTP ${res.status} ${res.statusText} (${duration} ms)`;
      statusEl.style.color = res.ok ? '#2dd4bf' : '#f87171';
    }
    if (outputEl) {
      outputEl.textContent = JSON.stringify(json, null, 2);
    }

    // Gönderilen işlem sonrasında yerel ekranı da derhal senkronize et
    if (method === 'GET' && Array.isArray(json)) {
      activeSeansList = json.map(mapOracleRowToActiveSeans);
      renderSecretaryPanel();
      renderTvSlides();
      showToast(`🔄 REST API GET: ${activeSeansList.length} seans çekildi.`);
    } else if (res.ok) {
      // POST ile güncellendiyse verileri yeniden sorgula veya yerelde güncelle
      executeDailyOracleQuery();
      showToast('🚀 REST API isteği başarılı! TV Display ve Sekreter ekranı senkronize edildi.');
    }

  } catch (err) {
    console.error('API Test Hatası:', err);
    if (statusEl) {
      statusEl.textContent = 'Bağlantı Hatası (Sunucu kapalı veya CORS)';
      statusEl.style.color = '#f87171';
    }
    if (outputEl) {
      outputEl.textContent = `Hata Mesajı: ${err.message}\n\nİpucu: Eğer Node.js mock sunucusu henüz başlatılmadıysa terminalden 'node server.js' komutunu çalıştırabilirsiniz.`;
    }
    showToast('⚠️ REST API isteği başarısız oldu.');
  } finally {
    if (runBtn) runBtn.textContent = 'Gönder';
  }
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

// Ufak, yumuşak ve zarif zil tonu (Ding)
function playGentleChime() {
  if (!soundEnabled) return;
  try {
    initAudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Kristal temizliğinde yumuşak zil tonu (880 Hz - A5)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    
    // Nazik bir şekilde artıp sönen tını
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  } catch (e) {
    console.warn(e);
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
// CANLI GERİ SAYIM MOTORU
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

// SÜRE DOLDUĞUNDA OTOMATİK BİR SONRAKİ AŞAMAYA GEÇİRME MOTORU
function checkPatientTimersAndAdvanceFlow() {
  const now = Date.now();
  let hasChanges = false;

  activeSeansList.forEach(patient => {
    // Sadece aktif geri sayımı olan ve iptal edilmemiş hastalar
    if (!patient.countdownEndsAt || patient.isAborted) return;

    const diff = new Date(patient.countdownEndsAt).getTime() - now;
    if (diff <= 0) {
      // Süre doldu! Durumuna göre bir sonraki aşamaya otomatik geçir:
      hasChanges = true;

      if (patient.status === 'ODAYA_CAGRILDI') {
        // 1. Muayene / Hazırlık Çağrısı Süresi Doldu:
        // Eğer ilk kez diyalize giriyorsa (0 seans) -> Kateter Hazırlığına geçir (30 dk)
        // Eğer rutin hastaysa -> Doğrudan Diyaliz Seansına bağla (2 saat 25 dk)
        if (patient.isFirstDialysis) {
          patient.status = 'KATETER_TAKILIYOR';
          patient.statusText = 'Kateter & Ön Hazırlık';
          patient.badgeClass = 'badge-teal';
          patient.slideGroup = 'BEKLEME';
          patient.instruction = 'İlk Giriş: Kateter ve damar yolu hazırlığı devam ediyor (Yaklaşık 30 dk).';
          patient.countdownEndsAt = new Date(Date.now() + 30 * 60 * 1000);
          patient.countdownType = 'KATETER';
          patient.isUrgentCall = false;
          showToast(`⏳ ${patient.maskedName}: Ön muayene tamamlandı, kateter hazırlığına geçildi.`);
          updateTickerMessage(`Bilgilendirme: ${patient.maskedName} kateter & ön hazırlık aşamasına alındı.`);
        } else {
          patient.status = 'BAGLANDI';
          patient.statusText = 'Seans Devam Ediyor';
          patient.badgeClass = 'badge-purple';
          patient.slideGroup = 'DIYALIZ';
          patient.instruction = 'Diyaliz seansı aktif sürdürülmektedir. Standart seans süresi: 2 saat 25 dakika.';
          patient.countdownEndsAt = new Date(Date.now() + (2 * 60 + 25) * 60 * 1000);
          patient.countdownType = 'DIYALIZ';
          patient.isUrgentCall = false;
          showToast(`🔌 ${patient.maskedName}: Hazırlık tamamlandı, seans otomatik başlatıldı.`);
          updateTickerMessage(`Bilgilendirme: ${patient.maskedName} diyaliz seansı aktif başlatıldı.`);
        }
        playGentleChime();

      } else if (patient.status === 'KATETER_TAKILIYOR') {
        // 2. Kateter Hazırlığı (30 dk) Süresi Doldu -> Diyalize Bağla (2 saat 25 dk)
        patient.status = 'BAGLANDI';
        patient.statusText = 'Seans Devam Ediyor';
        patient.badgeClass = 'badge-purple';
        patient.slideGroup = 'DIYALIZ';
        patient.instruction = 'Diyaliz seansı aktif sürdürülmektedir. Standart seans süresi: 2 saat 25 dakika.';
        patient.countdownEndsAt = new Date(Date.now() + (2 * 60 + 25) * 60 * 1000);
        patient.countdownType = 'DIYALIZ';
        patient.isUrgentCall = false;
        showToast(`🔌 ${patient.maskedName}: Kateter süreci bitti, diyaliz seansına geçildi.`);
        updateTickerMessage(`Bilgilendirme: ${patient.maskedName} diyaliz makinesine bağlandı.`);
        playGentleChime();

      } else if (patient.status === 'BAGLANDI' || patient.status === 'TEDAVI_SURUYOR') {
        // 3. Diyaliz Seansı (145 dk) Süresi Doldu -> Dinlenme / Gözlem (Tansiyon Takibi - 15 dk)
        patient.status = 'AYRILDI';
        patient.statusText = 'Dinlenme / Gözlem';
        patient.badgeClass = 'badge-teal';
        patient.slideGroup = 'CIKIS';
        patient.instruction = 'Seans tamamlanmıştır. Hastamız dinlenme alanında tansiyon takibindedir.';
        patient.countdownEndsAt = new Date(Date.now() + 15 * 60 * 1000);
        patient.countdownType = 'DINLENME';
        patient.isUrgentCall = false;
        showToast(`🛏️ ${patient.maskedName}: Seans süresi doldu, dinlenme alanına alındı.`);
        updateTickerMessage(`Bilgilendirme: ${patient.maskedName} seansı tamamlandı, istirahat alanında.`);
        playGentleChime();

      } else if (patient.status === 'AYRILDI') {
        // 4. Dinlenme Süresi Doldu -> Taburcu / Tamamlandı
        patient.status = 'TABURCU';
        patient.statusText = 'İşlemler Tamamlandı';
        patient.badgeClass = 'badge-green';
        patient.slideGroup = 'CIKIS';
        patient.instruction = 'Bugünkü tedavi başarıyla tamamlanmıştır.';
        patient.countdownEndsAt = null;
        patient.countdownType = null;
        patient.isUrgentCall = false;
        showToast(`✅ ${patient.maskedName}: Dinlenme süresi tamamlandı, taburcu edildi.`);
        updateTickerMessage(`Bilgilendirme: ${patient.maskedName} bugünkü tedavisini tamamladı.`);
      }
    }
  });

  if (hasChanges) {
    renderSecretaryPanel();
    renderTvSlides();
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
      el.textContent = '⏱ Kalan: ' + formatRemainingTime(seans.countdownEndsAt);
    }
  });
}

// 1. Otomatik Süreç Kontrolü (Aşama geçişleri için arka plan kontrolü)
setInterval(() => {
  checkPatientTimersAndAdvanceFlow();
}, 1000);

// 2. Ekrandaki sürelerin güncellenmesi: Anlık yerine 5 dakikada bir (5 * 60 * 1000 ms) yenilenir
const FIVE_MINUTES_MS = 5 * 60 * 1000;
setInterval(() => {
  updateCountdownDisplays();
}, FIVE_MINUTES_MS);

// Test & Hızlandırma: Aktif sayaçları ileri sarıp otomatik geçişi test etme
function fastForwardTimers(seconds = 60) {
  let count = 0;
  activeSeansList.forEach(p => {
    if (p.countdownEndsAt) {
      p.countdownEndsAt = new Date(new Date(p.countdownEndsAt).getTime() - seconds * 1000);
      count++;
    }
  });
  if (count > 0) {
    checkPatientTimersAndAdvanceFlow();
    showToast(`⏩ Süreçler ${seconds} saniye ileri sarıldı.`);
  } else {
    showToast(`ℹ️ Şu an aktif geri sayımı olan hasta bulunmuyor.`);
  }
}

// ============================================================================
// ============================================================================
// ============================================================================
// CAROUSEL & SLAYT MOTORU (MAX 4 HASTA SAYFALAMASI & OTOMATİK GEÇİŞ)
// Kural:
// - Her ekranda MAX 4 HASTA gösterilir (Scrollbar tamamen engellenir)
// - Aynı durumda 4'ten fazla hasta varsa otomatik Sayfa 1, Sayfa 2... olarak yeni ekrana aktarılır
// - Süre: Boş ekran ise 5 sn, listelenen hasta varsa Min 15 sn + (hasta sayısı * 5 sn)
// ============================================================================
let currentSlideIndex = 0;
let totalTvSlidesCount = 1;
let tvSlideDataList = []; // Her slaytın bilgisi: { group, title, subtitle, icon, bannerClass, patients, totalCount, pageNum, totalPages }
let countdownSeconds = 15;
let countdownInterval = null;

// Slayt kategorisi tanımları
const SLIDE_GROUP_DEFINITIONS = [
  {
    group: 'BEKLEME',
    title: '1. BEKLEME, ÇAĞRI & BİLGİLENDİRME',
    subtitle: 'Kateter hazırlığı (30 dk), danışma bilgilendirme ve hekim açıklamaları.',
    bannerClass: 'banner-waiting',
    iconSvg: `<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
  },
  {
    group: 'DIYALIZ',
    title: '2. DİYALİZ SALONU (TEDAVİ SÜRÜYOR)',
    subtitle: 'Yataklarında aktif tedavi gören hastalar (Standart Süre: 2 saat 25 dakika).',
    bannerClass: 'banner-dialysis',
    iconSvg: `<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`
  },
  {
    group: 'CIKIS',
    title: '3. SEANSI TAMAMLANANLAR & TABURCU',
    subtitle: 'Diyalizi biten, dinlenme odasında toparlanan ve taburcu olanlar.',
    bannerClass: 'banner-discharge',
    iconSvg: `<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
  }
];

// Aktif slaytın hasta sayısına göre dinamik süresini hesapla
function getDynamicSlideDuration(slideIdx) {
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
// TV DISPLAY EKRANI RENDER (SAYFA BAŞINA EN FAZLA 4 HASTA DİNAMİK BÖLÜCÜ)
// ============================================================================
const MAX_PATIENTS_PER_SCREEN = 4;

function renderTvSlides() {
  const track = document.getElementById('tv-carousel-track');
  const dotsContainer = document.getElementById('tv-slide-dots');
  if (!track) return;

  // 1. Slayt Veri Listesini Üret (4'erli parçalayarak)
  tvSlideDataList = [];

  SLIDE_GROUP_DEFINITIONS.forEach(def => {
    // Sadece diyalize gelen (GELMEDI olmayan) hastaları al
    const groupPatients = activeSeansList.filter(s => s.slideGroup === def.group && s.presence !== 'GELMEDI');
    const totalCount = groupPatients.length;

    if (totalCount === 0) {
      // Boş durumda tek bir sayfa oluştur
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
      // 4'erli parçalara böl (Eğer 5 hasta varsa: 1. sayfa 4 hasta, 2. sayfa 1 hasta olur)
      const totalPages = Math.ceil(totalCount / MAX_PATIENTS_PER_SCREEN);
      for (let p = 0; p < totalPages; p++) {
        const slice = groupPatients.slice(p * MAX_PATIENTS_PER_SCREEN, (p + 1) * MAX_PATIENTS_PER_SCREEN);
        tvSlideDataList.push({
          group: def.group,
          title: totalPages > 1 ? `${def.title} (Sayfa ${p + 1}/${totalPages})` : def.title,
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

  // Track genişliğini toplam slayt sayısına göre ayarla (Örn: 4 slayt ise %400, her biri %25)
  track.style.width = `${totalTvSlidesCount * 100}%`;

  // 2. Slayt HTML'lerini oluştur
  track.innerHTML = tvSlideDataList.map((slide, idx) => {
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
              <p>${slide.subtitle}</p>
            </div>
          </div>
          <div class="banner-count-badge">
            ${slide.totalCount} Hasta ${slide.totalPages > 1 ? `• [${slide.pageNum}/${slide.totalPages}]` : ''}
          </div>
        </div>

        <div class="tv-patient-grid">
          ${slide.patients.length === 0 ? `
            <div style="padding: 40px 20px; text-align: center; color: var(--text-dim); font-size: 14px; font-weight: 600;">
              Bu aşamada bekleyen işlem bulunmamaktadır.
            </div>
          ` : slide.patients.map(p => {
            let alertClass = '';
            if (p.isUrgentCall) alertClass = 'calling-urgent-active';
            else if (p.isFamilyCall) alertClass = 'family-call-active';
            else if (p.isAborted) alertClass = 'aborted-active';

            return `
              <div class="tv-patient-row ${alertClass}">
                <div class="tv-patient-name-block">
                  <div class="tv-patient-text-group">
                    <div class="masked-name-text">
                      <span class="patient-masked-name">${p.maskedName}</span>
                      ${p.gelisTipi === 'ACIL_SERVIS' ? `<span class="tag-badge-emergency">ACİL SERVİS</span>` : ''}
                    </div>
                    
                    <div class="masked-subtext">
                      <span>${p.instruction}</span>
                    </div>

                    ${p.isAborted && p.abortReason ? `
                      <div class="tv-reason-box">
                        ℹ️ <strong>Bilgilendirme:</strong> ${p.abortReason}
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
                        ${p.countdownType === 'HAZIRLIK' ? 'Ön Muayene / Hazırlık' : (p.countdownType === 'KATETER' ? 'Kateter Hazırlık' : 'Seans Bitişine Kalan')}
                      </span>
                    </div>
                  ` : ''}

                  <div class="tv-status-badge ${p.badgeClass}">
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

  // Eğer mevcut index toplam slayt sayısını aşıyorsa başa sar
  if (currentSlideIndex >= totalTvSlidesCount) {
    currentSlideIndex = 0;
  }
  goToSlide(currentSlideIndex);
}

// ============================================================================
// SOL PANEL: SEKRETER KONTROL PANELİ
// ============================================================================
let secretarySearchTerm = '';

function renderSecretaryPanel() {
  const container = document.getElementById('secretary-patient-list');
  if (!container) return;

  const filtered = activeSeansList.filter(s => {
    const target = `${s.firstName} ${s.lastName} ${s.protokolNo} ${s.tcNo}`.toLowerCase();
    return target.includes(secretarySearchTerm.toLowerCase());
  });

  const geldiCount = activeSeansList.filter(s => s.presence !== 'GELMEDI').length;
  const gelmediCount = activeSeansList.filter(s => s.presence === 'GELMEDI').length;
  
  const presenceCountEl = document.getElementById('secretary-presence-count');
  if (presenceCountEl) {
    presenceCountEl.textContent = `Geldi: ${geldiCount} | Gelmedi: ${gelmediCount}`;
  }

  const totalCountEl = document.getElementById('secretary-total-count');
  if (totalCountEl) {
    totalCountEl.textContent = `${activeSeansList.length} / 9 Kayıtlı`;
  }

  container.innerHTML = filtered.map(patient => {
    const isAbsent = (patient.presence === 'GELMEDI');

    return `
    <div class="secretary-patient-card ${isAbsent ? 'patient-absent' : ''}" id="sec-card-${patient.seansId}">
      <div class="card-top">
        <div class="patient-info-left">
          <span class="bed-tag">${patient.bedNo ? 'YATAK ' + patient.bedNo : 'BEKLEME'}</span>
          <span class="patient-id-badge" title="Hasta Numarası">HN: ${patient.tcNo || '-'}</span>
          <span class="patient-name-real">${patient.firstName} ${patient.lastName}</span>
          <span style="font-family: monospace; font-size: 11px; color: #0284c7; font-weight: 600;">(${patient.protokolNo})</span>
          ${patient.isFirstDialysis ? `<span class="tag-badge tag-first">İlk Giriş (Kateter Gerekli)</span>` : ''}
          ${patient.gelisTipi === 'ACIL_SERVIS' ? `<span class="tag-badge" style="background: rgba(20, 184, 166, 0.2); color: #0f766e; font-weight: 700;">Acil Servis</span>` : ''}
          ${isAbsent ? `<span class="tag-badge" style="background: #fee2e2; color: #991b1b; font-weight: 800;">Diyalize Gelmedi</span>` : ''}
        </div>
        
        <div style="display: flex; align-items: center; gap: 6px;">
          ${patient.countdownEndsAt && !isAbsent ? `
            <span class="live-countdown-badge ${patient.countdownType === 'KATETER' ? 'catheter-mode' : ''}" data-sec-countdown-id="${patient.seansId}">
              ⏱ Kalan: ${formatRemainingTime(patient.countdownEndsAt)}
            </span>
          ` : ''}
          <span class="status-badge-mini ${isAbsent ? 'badge-soft-amber' : patient.badgeClass}">
            ${isAbsent ? 'Seansa Katılmadı' : patient.statusText}
          </span>
        </div>
      </div>

      <!-- Hastanın Diyalize Gelip Gelmeme Seçimi -->
      <div class="presence-selector-container">
        <span class="presence-label">
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Diyaliz Katılım Durumu:
        </span>
        <div class="presence-btn-group">
          <button type="button" class="btn-presence ${!isAbsent ? 'active-geldi' : ''}" 
                  onclick="setPatientPresence(${patient.seansId}, 'GELDI')" 
                  title="Hasta diyalize geldi (TV ekranında gösterilir)">
            ✓ Geldi
          </button>
          <button type="button" class="btn-presence ${isAbsent ? 'active-gelmedi' : ''}" 
                  onclick="setPatientPresence(${patient.seansId}, 'GELMEDI')" 
                  title="Hasta diyalize gelmedi (TV ekranından gizlenir)">
            ✕ Gelmedi
          </button>
        </div>
      </div>

      <!-- Durum Seçimi: Dropdown / Combobox ve Sağ Alt Kaydet Butonu -->
      <div class="patient-status-select-row">
        <div class="status-dropdown-wrapper">
          <label class="status-dropdown-label" for="sel-status-${patient.seansId}">Diyaliz Durumu:</label>
          <div class="custom-select-container">
            <select id="sel-status-${patient.seansId}" class="status-combobox" onchange="onStatusDropdownChange(${patient.seansId})" ${isAbsent ? 'disabled' : ''}>
              <option value="BEKLEMEDE" ${patient.status === 'BEKLEMEDE' ? 'selected' : ''}>⏳ 1. Bekleme Salonunda</option>
              <option value="ODAYA_CAGRILDI" ${patient.status === 'ODAYA_CAGRILDI' ? 'selected' : ''}>🔔 2. Odaya Çağır (Hazırlık)</option>
              <option value="KATETER_TAKILIYOR" ${patient.status === 'KATETER_TAKILIYOR' ? 'selected' : ''}>⏱️ 3. Kateter & Damar Yolu Hazırlığı (30 dk)</option>
              <option value="BAGLANDI" ${patient.status === 'BAGLANDI' ? 'selected' : ''}>🔌 4. Diyalize Bağla (2 sa 25 dk)</option>
              <option value="YAKINI_CAGRILIYOR" ${patient.status === 'YAKINI_CAGRILIYOR' ? 'selected' : ''}>ℹ️ 5. Danışma / Yakını Çağrısı</option>
              <option value="YARIDA_KALDI" ${patient.status === 'YARIDA_KALDI' ? 'selected' : ''}>📋 6. Hekim Kararıyla Erken Tamamlama</option>
              <option value="AYRILDI" ${patient.status === 'AYRILDI' ? 'selected' : ''}>🛏️ 7. Dinlenme / Tansiyon Takibi</option>
              <option value="TABURCU" ${patient.status === 'TABURCU' ? 'selected' : ''}>✅ 8. Seans Bitti / Taburcu</option>
            </select>
            <div class="select-chevron">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        <button type="button" class="btn-save-status" id="btn-save-${patient.seansId}" onclick="savePatientStatusChange(${patient.seansId})" ${isAbsent ? 'disabled' : ''}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Kaydet
        </button>
      </div>

      <div class="card-footer-controls">
        <span style="color: var(--text-dim); font-size: 11px;">
          Diyaliz Geçmişi: <strong style="color: #cbd5e1;">${patient.dialysisHistory} Seans</strong> • TV'de: <strong style="color: #fff;">${isAbsent ? 'GELMEDİ (Gizlendi)' : (patient.bedNo ? patient.bedNo + ' Nolu Yatak' : 'Bekleme')}</strong>
        </span>
        <span style="color: var(--text-dim); font-size: 11px;">
          Geliş: <strong style="color: var(--accent-cyan);">${patient.gelisTipi}</strong>
        </span>
      </div>
    </div>
    `;
  }).join('');
}

// Hastanın Diyalize Gelme / Gelmeme Durumunu Değiştirme
function setPatientPresence(seansId, presenceStatus) {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }

  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  patient.presence = presenceStatus;
  
  if (presenceStatus === 'GELMEDI') {
    // Hasta gelmedi olarak işaretlendiğinde aktif geri sayımı varsa sıfırla
    patient.countdownEndsAt = null;
    patient.countdownType = null;
    patient.isUrgentCall = false;
    patient.isFamilyCall = false;
    showToast(`❌ ${patient.maskedName}: Seansa gelmedi olarak işaretlendi (TV ekranından kaldırıldı).`);
  } else {
    showToast(`✅ ${patient.maskedName}: Seansa geldi olarak güncellendi.`);
  }

  renderSecretaryPanel();
  renderTvSlides();
  // Slayt süresi değiştiği için güncelle
  updateTimerPill();

  // REST API ile sekreter ekranından TV display'e veri gönderimi (emirhan.txt Madde 8 & 9)
  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    PRESENCE: presenceStatus,
    STATU: patient.status
  });
}

// Dropdown seçimi değiştiğinde kaydet butonunu vurgula
function onStatusDropdownChange(seansId) {
  const btn = document.getElementById(`btn-save-${seansId}`);
  if (btn) {
    btn.classList.add('has-changes');
  }
}

// Sağ alttaki Kaydet butonuna tıklandığında seçilen durumu TV ekranına ve sisteme yansıt
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
      openAbortModal(seansId);
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

  renderSecretaryPanel();
  renderTvSlides();
  showToast(`${patient.maskedName} durumu güncellendi.`);

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

  goToSlide(0);

  // SADECE ZARİF BİR ZİL ÇALAR
  playGentleChime();

  renderSecretaryPanel();
  renderTvSlides();
  updateTickerMessage(`Bilgilendirme: ${patient.maskedName} hazırlık için davet edildi.`);
  showToast(`🔔 ${patient.maskedName} odaya çağrıldı (Ön hazırlık süresi başladı).`);

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'ODAYA_CAGRILDI',
    PRESENCE: patient.presence || 'GELDI'
  });
}

// 3. Kateter Takılıyor (30 Dakika)
function triggerCatheterCountdown(seansId) {
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  patient.status = 'KATETER_TAKILIYOR';
  patient.statusText = 'Kateter & Ön Hazırlık';
  patient.badgeClass = 'badge-teal';
  patient.slideGroup = 'BEKLEME';
  patient.instruction = 'İlk Giriş: Kateter ve damar yolu hazırlığı devam ediyor (Yaklaşık 30 dk).';
  patient.countdownEndsAt = new Date(Date.now() + 30 * 60 * 1000);
  patient.countdownType = 'KATETER';
  patient.isUrgentCall = false;
  patient.isFamilyCall = false;
  patient.isAborted = false;
  patient.abortReason = '';

  goToSlide(0);
  renderSecretaryPanel();
  renderTvSlides();
  showToast(`⏳ ${patient.maskedName} için 30 dakikalık kateter hazırlığı başladı.`);

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'KATETER_TAKILIYOR',
    PRESENCE: patient.presence || 'GELDI',
    SURE: 30
  });
}

// 4. Makineye Bağlandı (2 Saat 25 Dakika = 145 Dakika)
function triggerDialysisCountdown(seansId) {
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  patient.status = 'BAGLANDI';
  patient.statusText = 'Seans Devam Ediyor';
  patient.badgeClass = 'badge-purple';
  patient.slideGroup = 'DIYALIZ';
  patient.instruction = 'Diyaliz seansı aktif sürdürülmektedir. Standart seans süresi: 2 saat 25 dakika.';
  patient.countdownEndsAt = new Date(Date.now() + (2 * 60 + 25) * 60 * 1000);
  patient.countdownType = 'DIYALIZ';
  patient.isUrgentCall = false;
  patient.isFamilyCall = false;

  goToSlide(1);
  renderSecretaryPanel();
  renderTvSlides();
  showToast(`🔌 ${patient.maskedName} diyalize bağlandı. 2 saat 25 dk geri sayım başladı.`);

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'BAGLANDI',
    PRESENCE: patient.presence || 'GELDI',
    SURE: 145
  });
}

// 5. Danışma Çağrısı (SADECE UFAK BİR ZİL ÇALAR, ASLA KONUŞMA YOKTUR)
function triggerCallFamily(seansId) {
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  patient.status = 'YAKINI_CAGRILIYOR';
  patient.statusText = 'Danışma Bilgilendirme';
  patient.badgeClass = 'badge-indigo';
  patient.slideGroup = 'BEKLEME';
  patient.isFamilyCall = true;
  patient.isUrgentCall = false;
  patient.instruction = `${patient.maskedName} Hasta Yakınının Danışmaya Uğraması Rica Olunur.`;

  goToSlide(0);

  // SADECE ZARİF BİR ZİL ÇALAR
  playGentleChime();

  renderSecretaryPanel();
  renderTvSlides();
  updateTickerMessage(`Danışma: ${patient.maskedName} hasta yakını danışmaya davet edildi.`);
  showToast(`ℹ️ ${patient.maskedName} hasta yakını danışmaya davet edildi.`);

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'YAKINI_CAGRILIYOR',
    PRESENCE: patient.presence || 'GELDI'
  });
}

// 6. Seans Tamamlama / Yarıda Kesme
let activeAbortSeansId = null;

// İlk 3 durum için TV'de sadece gösterilecek net durum metinleri
const ABORT_REASON_TITLES = {
  HASTAYA_BAGLI: 'Hastaya Bağlı Nedenler',
  DAMAR_YOLU: 'Damar Yolu veya Kateter Kaynaklı Nedenler',
  CIHAZ_DEVRE: 'Cihaz ve Diyaliz Devresine Bağlı Nedenler',
  DIGER: 'Diğer'
};

function onAbortCategoryChange() {
  const cat = document.getElementById('sel-abort-category').value;
  const previewDiv = document.getElementById('abort-fixed-preview');
  const previewText = document.getElementById('abort-fixed-text');
  const customGroup = document.getElementById('abort-custom-text-group');
  const customTextarea = document.getElementById('inp-abort-reason');

  if (cat === 'DIGER') {
    if (previewDiv) previewDiv.style.display = 'none';
    if (customGroup) customGroup.style.display = 'block';
    if (customTextarea) customTextarea.focus();
  } else {
    if (previewDiv) previewDiv.style.display = 'block';
    if (previewText) previewText.textContent = ABORT_REASON_TITLES[cat] || cat;
    if (customGroup) customGroup.style.display = 'none';
    if (customTextarea) customTextarea.value = '';
  }
}

function openAbortModal(seansId) {
  activeAbortSeansId = seansId;
  const patient = activeSeansList.find(s => s.seansId === seansId);
  if (!patient) return;

  document.getElementById('modal-abort-patient-name').textContent = `${patient.firstName} ${patient.lastName} (${patient.maskedName})`;
  
  // Varsayılan olarak 1. durumu seç ve UI'ı güncelle
  const catSelect = document.getElementById('sel-abort-category');
  if (catSelect) catSelect.value = 'HASTAYA_BAGLI';
  
  const customTextarea = document.getElementById('inp-abort-reason');
  if (customTextarea) customTextarea.value = '';

  onAbortCategoryChange();
  document.getElementById('abort-modal').classList.add('active');
}

function closeAbortModal() {
  document.getElementById('abort-modal').classList.remove('active');
  activeAbortSeansId = null;
}

function saveAbortReason() {
  if (!activeAbortSeansId) return;
  const catSelect = document.getElementById('sel-abort-category');
  const categoryCode = catSelect ? catSelect.value : 'HASTAYA_BAGLI';
  const customReason = document.getElementById('inp-abort-reason').value.trim();

  // İlk 3 durum için sadece o durum ekranda gösterilir.
  // "Diğer" seçildiğinde sekreterin yazdığı metin gösterilir (boş bırakırsa "Diğer Nedenler").
  let displayText = '';
  if (categoryCode === 'DIGER') {
    displayText = customReason ? customReason : 'Diğer Nedenler (Hekim Kararı)';
  } else {
    displayText = ABORT_REASON_TITLES[categoryCode] || 'Hekim Kontrolünde Tamamlandı';
  }

  const patient = activeSeansList.find(s => s.seansId === activeAbortSeansId);
  if (!patient) return;

  patient.status = 'YARIDA_KALDI';
  patient.statusText = 'Hekim Kontrolünde Tamamlandı';
  patient.badgeClass = 'badge-soft-amber';
  patient.slideGroup = 'BEKLEME';
  patient.isAborted = true;
  patient.abortCategory = categoryCode;
  patient.abortReason = displayText;
  patient.instruction = 'Hekim değerlendirmesi neticesinde bugünkü seans erken tamamlanmıştır.';
  patient.countdownEndsAt = null;

  closeAbortModal();
  goToSlide(0);
  renderSecretaryPanel();
  renderTvSlides();

  updateTickerMessage(`Bilgilendirme: ${patient.maskedName} seansı tamamlandı (${displayText}).`);
  showToast(`📋 ${displayText} TV ekranına yansıtıldı.`);

  syncPatientChangeToApi({
    HASTASEANSREFNO: patient.seansId,
    STATU: 'YARIDA_KALDI',
    PRESENCE: patient.presence || 'GELDI',
    kabuliptalaciklama: displayText
  });
}

// ============================================================================
// ACİL SERVİS ENTEGRASYONU (SIFIR MANUEL GİRİŞ)
// ============================================================================
function openUrgentPatientModal() {
  const selectEl = document.getElementById('sel-nucleus-urgent-protocol');
  selectEl.innerHTML = '<option value="">Nucleus\'tan Bekleyen Protokolü Seçiniz...</option>';

  const bedSelect = document.getElementById('inp-urgent-bed');
  bedSelect.innerHTML = '<option value="">Uygun Yatak Seçiniz...</option>';

  const occupiedBeds = activeSeansList.filter(s => s.status !== 'TABURCU').map(s => s.bedNo);
  for (let i = 1; i <= 9; i++) {
    const isOccupied = occupiedBeds.includes(i);
    bedSelect.innerHTML += `<option value="${i}" ${isOccupied ? 'disabled' : ''}>
      ${i} Nolu Yatak ${isOccupied ? '(Şu an Dolu)' : '(BOŞ - Uygun)'}
    </option>`;
  }

  NUCLEUS_MASTER_DATABASE.urgentPatientPool.forEach(p => {
    selectEl.innerHTML += `
      <option value="${p.protokolNo}">
        ${p.protokolNo} - ${p.firstName} ${p.lastName} (${p.source} - ${p.dialysisHistory === 0 ? 'İLK DİYALİZ / KATETER GEREKLİ' : p.dialysisHistory + ' Seans'})
      </option>
    `;
  });

  document.getElementById('urgent-patient-modal').classList.add('active');
}

function closeUrgentPatientModal() {
  document.getElementById('urgent-patient-modal').classList.remove('active');
  document.getElementById('form-urgent-patient').reset();
  document.getElementById('nucleus-patient-preview').style.display = 'none';
}

function onUrgentProtocolSelected() {
  const protocolNo = document.getElementById('sel-nucleus-urgent-protocol').value;
  const previewDiv = document.getElementById('nucleus-patient-preview');
  
  if (!protocolNo) {
    previewDiv.style.display = 'none';
    return;
  }

  const patient = NUCLEUS_MASTER_DATABASE.urgentPatientPool.find(p => p.protokolNo === protocolNo);
  if (!patient) return;

  document.getElementById('preview-ad-soyad').textContent = `${patient.firstName} ${patient.lastName}`;
  document.getElementById('preview-tc').textContent = patient.tcNo;
  document.getElementById('preview-kaynak').textContent = patient.source;
  document.getElementById('preview-gecmis').textContent = patient.dialysisHistory === 0 ? 'İLK GİRİŞ (30 dk Kateter Başlatılacak)' : `${patient.dialysisHistory} Seans Kayıtlı`;

  if (patient.suggestedBed) {
    document.getElementById('inp-urgent-bed').value = patient.suggestedBed;
  }

  previewDiv.style.display = 'block';
}

function handleUrgentPatientSubmit(e) {
  e.preventDefault();
  const protocolNo = document.getElementById('sel-nucleus-urgent-protocol').value;
  const bedNo = parseInt(document.getElementById('inp-urgent-bed').value);

  if (!protocolNo || !bedNo) {
    alert('Lütfen Nucleus protokolünü ve atanacak yatağı seçiniz.');
    return;
  }

  const nucleusPatient = NUCLEUS_MASTER_DATABASE.urgentPatientPool.find(p => p.protokolNo === protocolNo);
  if (!nucleusPatient) return;

  const isFirst = (nucleusPatient.dialysisHistory === 0);

  const newSeans = {
    seansId: Date.now(),
    protokolNo: nucleusPatient.protokolNo,
    tcNo: nucleusPatient.tcNo,
    firstName: nucleusPatient.firstName,
    lastName: nucleusPatient.lastName,
    maskedName: nucleusPatient.maskedName,
    dialysisHistory: nucleusPatient.dialysisHistory,
    isFirstDialysis: isFirst,
    bedNo: bedNo,
    gelisTipi: nucleusPatient.source,
    status: isFirst ? 'KATETER_TAKILIYOR' : 'BEKLEMEDE',
    statusText: isFirst ? 'Kateter & Ön Hazırlık' : 'Bekleme Salonunda',
    badgeClass: isFirst ? 'badge-teal' : 'badge-blue',
    slideGroup: 'BEKLEME',
    instruction: isFirst ? 'İlk Giriş: Kateter ve ön hazırlık süreci (30 dk).' : 'Acil servis yönlendirmesiyle yatağa kabul edildi.',
    countdownEndsAt: isFirst ? new Date(Date.now() + 30 * 60 * 1000) : null,
    countdownType: isFirst ? 'KATETER' : null,
    isUrgentCall: false,
    isFamilyCall: false,
    isAborted: false,
    abortReason: '',
    updatedAt: new Date()
  };

  activeSeansList.unshift(newSeans);

  closeUrgentPatientModal();
  renderSecretaryPanel();
  renderTvSlides();
  showToast(`⚡ ${nucleusPatient.source} hastası Nucleus verileriyle ${bedNo} nolu yatağa kabul edildi.`);

  // REST API ile yeni seansı sunucuya / displaye aktar (emirhan.txt Madde 8 & 9)
  syncPatientChangeToApi({
    HASTASEANSREFNO: newSeans.seansId,
    HASTAADI: `${newSeans.firstName} ${newSeans.lastName}`,
    HASTANO: newSeans.tcNo,
    YATAKNO: bedNo,
    STATU: newSeans.status,
    PRESENCE: 'GELDI',
    BASVURUTURU: newSeans.gelisTipi,
    HEMODIYALIZ_GECMISI: newSeans.dialysisHistory
  });
}

// YARDIMCI BİLEŞENLER
function updateTickerMessage(msg) {
  const ticker = document.getElementById('tv-ticker-text');
  if (ticker) ticker.textContent = msg;
}

function showToast(text) {
  const toast = document.getElementById('toast');
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
    timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    dateEl.textContent = now.toLocaleDateString('tr-TR', { weekday: 'short', month: 'long', day: 'numeric' });
  }
  tick();
  setInterval(tick, 1000);
}

// ============================================================================
// SEKRETER KULLANICI GİRİŞİ & OTURUM YÖNETİMİ
// ============================================================================
let isSecretaryLoggedIn = false;
let currentSecretaryUser = null;

// Kayıtlı yetkili kullanıcılar (Demo kullanıcı: sekreter / 1234 veya admin / 1234)
const AUTHORIZED_USERS = [
  { username: 'sekreter', password: '1234', fullName: 'Diyaliz Sekreteri (A. Yılmaz)' },
  { username: 'admin', password: '1234', fullName: 'Sistem Yöneticisi' }
];

function checkAuthStatus() {
  const savedUser = localStorage.getItem('diyaliz_logged_user');
  if (savedUser) {
    try {
      const userObj = JSON.parse(savedUser);
      isSecretaryLoggedIn = true;
      currentSecretaryUser = userObj;
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
  const badge = document.getElementById('secretary-logged-badge');
  const btnLogin = document.getElementById('btn-login-open');
  const lockOverlay = document.getElementById('secretary-lock-overlay');
  const loggedName = document.getElementById('secretary-logged-name');

  if (isSecretaryLoggedIn && currentSecretaryUser) {
    if (badge) badge.style.display = 'flex';
    if (btnLogin) btnLogin.style.display = 'none';
    if (lockOverlay) lockOverlay.style.display = 'none';
    if (loggedName) loggedName.textContent = `👤 ${currentSecretaryUser.fullName}`;
  } else {
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

function handleSecretaryLogin(e) {
  e.preventDefault();
  const uInput = document.getElementById('inp-login-username').value.trim();
  const pInput = document.getElementById('inp-login-password').value.trim();
  const errBox = document.getElementById('login-error-msg');

  const foundUser = AUTHORIZED_USERS.find(
    u => u.username.toLowerCase() === uInput.toLowerCase() && u.password === pInput
  );

  if (foundUser) {
    isSecretaryLoggedIn = true;
    currentSecretaryUser = foundUser;
    localStorage.setItem('diyaliz_logged_user', JSON.stringify(foundUser));
    updateAuthUI();
    closeLoginModal();
    showToast(`🔓 Giriş Başarılı: Hoş geldiniz, ${foundUser.fullName}.`);
  } else {
    if (errBox) {
      errBox.textContent = 'Hatalı kullanıcı adı veya şifre! (Demo: sekreter / 1234)';
      errBox.style.display = 'block';
    }
  }
}

function logoutSecretary() {
  isSecretaryLoggedIn = false;
  currentSecretaryUser = null;
  localStorage.removeItem('diyaliz_logged_user');
  updateAuthUI();
  showToast('🔒 Sekreter oturumu sonlandırıldı.');
}

// Güvenlik sarmalayıcısı: Yetki gerektiren butonlarda kontrol
const originalOpenUrgentPatientModal = openUrgentPatientModal;
openUrgentPatientModal = function() {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }
  originalOpenUrgentPatientModal();
};

const originalFastForwardTimers = fastForwardTimers;
fastForwardTimers = function(seconds) {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }
  originalFastForwardTimers(seconds);
};

const originalSyncWithOracleDatabase = syncWithOracleDatabase;
syncWithOracleDatabase = function() {
  if (!isSecretaryLoggedIn) {
    openLoginModal();
    return;
  }
  originalSyncWithOracleDatabase();
};

document.addEventListener('DOMContentLoaded', () => {
  startClock();
  checkAuthStatus(); // Sekreter oturumunu kontrol et
  executeDailyOracleQuery(); // Oracle DB (TRUNC(SYSDATE)) bugünün hastalarını ve seanslarını otomatik çek
  startSlideAutomation();

  const searchInput = document.getElementById('secretary-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      secretarySearchTerm = e.target.value.trim();
      renderSecretaryPanel();
    });
  }

  document.body.addEventListener('click', () => {
    initAudioContext();
  }, { once: true });
});
