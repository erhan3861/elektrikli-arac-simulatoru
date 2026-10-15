// EV Lab · ders verisi
// Metinler kısa tutuldu: lise öğrencisi tek bakışta okuyabilsin.

export const PARTS = [
  {
    id: 'battery', short: 'Batarya', name: 'HV Batarya Paketi', group: 'Enerji deposu',
    color: 0x14b8a6, hv: true,
    cam: [3.3, 2.3, 3.5],
    desc: 'Aracın tabanında yatan 400 V DC enerji deposu. Yüzlerce lityum hücre seri-paralel bağlıdır.',
    stats: [['Gerilim', '400 V DC'], ['Kapasite', '60 kWh']],
    safe: 'Müdahale öncesi turuncu MSD fişi çekilir, HV eldiven takılır.',
    dmm: { vdc: '398.4 V', vac: '0.0 V', ohm: 'OL' },
    fault: { mode: 'vdc', value: '0.0 V', scenario: 'Araç uyanmıyor, hiç yüksek gerilim yok.' },
  },
  {
    id: 'bms', short: 'BMS', name: 'Batarya Yönetim Sistemi', group: 'Kontrol kartı',
    color: 0x22c55e, hv: false,
    cam: [1.6, 1.5, 2.4],
    desc: 'Bataryanın beyni. Hücre gerilimlerini dengeler, sıcaklığı izler, tehlikede kontaktörü açar.',
    stats: [['Besleme', '12 V DC'], ['Haberleşme', 'CAN-Bus']],
    safe: '12 V ile çalışır ama 400 V kontaktörlerini kumanda eder.',
    dmm: { vdc: '12.1 V', vac: '0.0 V', ohm: '10.0 kΩ' },
    fault: { mode: 'ohm', value: 'OL', scenario: 'Batarya "aşırı sıcaklık" hatası veriyor, kontaktör çekmiyor.' },
  },
  {
    id: 'inverter', short: 'İnverter', name: 'İnverter (DC → AC)', group: 'Güç elektroniği',
    color: 0xf97316, hv: true,
    cam: [-2.2, 1.8, -2.6],
    desc: '400 V DC\'yi 3 fazlı AC\'ye çevirir. AC frekansı arttıkça motor hızlanır.',
    stats: [['Çıkış', '3 faz AC'], ['Anahtar', 'IGBT / SiC']],
    safe: 'Kondansatörler araç kapansa bile 5 dakika yüksek gerilim tutar.',
    dmm: { vdc: '398 V', vac: '230 V', ohm: 'OL' },
    fault: { mode: 'vac', value: '0 V', scenario: 'Batarya dolu ama motora AC gitmiyor, araç hareket etmiyor.' },
  },
  {
    id: 'motor', short: 'Motor', name: '3 Fazlı Elektrik Motoru', group: 'Tahrik',
    color: 0x38bdf8, hv: true,
    cam: [0.4, 1.3, -3.4],
    desc: 'Üç faz, dönen bir manyetik alan oluşturur. Rotor bu alanı izler ve tekerlekleri döndürür.',
    stats: [['Tip', 'PMSM'], ['Sargı', '0.05 Ω']],
    safe: 'Tekerlek dönünce gerilim üretir; araç halatla çekilmez.',
    dmm: { vdc: '0.0 V', vac: '230 V', ohm: '0.05 Ω' },
    fault: { mode: 'ohm', value: 'OL', scenario: 'İnverter 3 faz veriyor ama tekerlek dönmüyor.' },
  },
  {
    id: 'dcdc', short: 'DC-DC', name: 'DC-DC Konvertör', group: 'Gerilim düşürücü',
    color: 0x2dd4bf, hv: true,
    cam: [2.4, 1.6, -2.4],
    desc: '400 V\'u 12 V\'a düşürür. Klasik araçtaki alternatörün yerini alır.',
    stats: [['Giriş', '400 V DC'], ['Çıkış', '14.2 V DC']],
    safe: 'Girişi yüksek gerilim, çıkışı düşük gerilim: iki tarafı karıştırma.',
    dmm: { vdc: '14.2 V', vac: '0.0 V', ohm: 'OL' },
    fault: { mode: 'vdc', value: '9.1 V', scenario: '12 V akü şarj olmuyor, ekranlar sönük.' },
  },
  {
    id: 'aux', short: '12 V Akü', name: '12 V Yardımcı Akü', group: 'Düşük gerilim',
    color: 0xa3a3a3, hv: false,
    cam: [2.4, 1.3, -3.2],
    desc: 'Aracı "uyandırır": ECU\'ları besler ve HV kontaktörlerini çeker. Farlar, ekran, silecek buradan beslenir.',
    stats: [['Gerilim', '12.6 V'], ['Tip', 'Kurşun-asit / LFP']],
    safe: 'Bu akü biterse HV batarya dolu olsa bile araç çalışmaz.',
    dmm: { vdc: '12.6 V', vac: '0.0 V', ohm: 'OL' },
    fault: { mode: 'vdc', value: '10.4 V', scenario: 'HV batarya %80 ama araç uyanmıyor.' },
  },
  {
    id: 'obc', short: 'OBC', name: 'Dahili Şarj Cihazı (OBC)', group: 'Doğrultucu',
    color: 0xfacc15, hv: true,
    cam: [-2.2, 1.7, 2.8],
    desc: 'Prizden gelen 230 V AC\'yi bataryanın istediği DC\'ye çevirir. DC hızlı şarjda devre dışıdır.',
    stats: [['Giriş', '230/400 V AC'], ['Güç', '11 kW']],
    safe: 'Şebeke ile araç arasında galvanik izolasyon sağlar.',
    dmm: { vdc: '398 V', vac: '230 V', ohm: 'OL' },
    fault: { mode: 'vdc', value: '0 V', scenario: 'Ev prizinde şarj olmuyor; DC hızlı şarj istasyonunda oluyor.' },
  },
  {
    id: 'port', short: 'Şarj Soketi', name: 'CCS2 Şarj Soketi', group: 'Bağlantı',
    color: 0xf43f5e, hv: true,
    cam: [3.0, 1.4, 2.6],
    desc: 'Üst pinler AC ve haberleşme (CP/PP), alt iki pin DC hızlı şarj içindir.',
    stats: [['Standart', 'CCS Combo 2'], ['Sinyal', 'CP 1 kHz PWM']],
    safe: 'Şarj sırasında fiş kilitlenir; kilit zorlanmaz.',
    dmm: { vdc: '9.0 V', vac: '230 V', ohm: '1.5 kΩ' },
    fault: { mode: 'vdc', value: '0.0 V', scenario: 'Kablo takılı ama istasyon aracı görmüyor.' },
  },
];

export const PART_BY_ID = Object.fromEntries(PARTS.map(p => [p.id, p]));

// Ders adımları: her adım tek fikir.
export const LESSON = [
  { title: 'Elektrikli araç', text: 'Üç ana parça: Batarya, İnverter, Motor. Turuncu kablolar yüksek gerilim taşır.', view: 'overview' },
  { focus: 'battery', text: 'HV batarya 400 V DC depolar. Yüzlerce lityum hücre seri-paralel bağlıdır.' },
  { focus: 'bms', text: 'BMS hücre gerilimlerini dengeler, sıcaklığı izler, tehlikede kontaktörü açar.' },
  { focus: 'inverter', text: 'İnverter DC\'yi 3 fazlı AC\'ye çevirir. Frekans arttıkça motor hızlanır.', throttle: 60 },
  { focus: 'motor', text: 'Üç faz dönen manyetik alan oluşturur. Rotor alanı izler: tork doğar.', throttle: 85 },
  { focus: 'motor', text: 'Frende motor jeneratör olur. Enerji bataryaya geri akar: rejeneratif fren.', throttle: -40 },
  { focus: 'dcdc', text: 'DC-DC konvertör 400 V\'u 12 V\'a düşürür. Farlar, ekran ve ECU\'lar buradan beslenir.' },
  { focus: 'aux', text: '12 V akü aracı uyandırır ve HV kontaktörlerini çeker. Biterse araç çalışmaz.' },
  { focus: 'port', text: 'AC şarj: OBC prizden gelen AC\'yi DC\'ye çevirir. DC hızlı şarj doğrudan bataryaya girer.', charge: true },
  { title: 'Güvenlik', text: 'Turuncu = yüksek gerilim. MSD\'yi çek, HV eldiven tak, 5 dakika bekle, sonra ölç.', view: 'overview', pulse: true },
];

export const QUIZ = [
  { type: 'part', q: '400 V DC depolayan parçaya tıkla.', answer: 'battery' },
  { type: 'mc', q: 'İnverterin görevi nedir?', options: ['DC → 3 faz AC', 'AC → DC', '400 V → 12 V'], answer: 0 },
  { type: 'part', q: 'DC\'yi 3 fazlı AC\'ye çeviren parçaya tıkla.', answer: 'inverter' },
  { type: 'mc', q: 'Turuncu kablo ne anlama gelir?', options: ['Yüksek gerilim', 'Topraklama', 'Veri hattı'], answer: 0 },
  { type: 'part', q: 'Hücre sıcaklığını ve dengesini izleyen karta tıkla.', answer: 'bms' },
  { type: 'mc', q: 'Rejeneratif frende motor ne olur?', options: ['Jeneratör', 'Isıtıcı', 'Kapanır'], answer: 0 },
  { type: 'part', q: 'Farları ve ekranı besleyen 12 V kaynağa tıkla.', answer: 'aux' },
  { type: 'mc', q: 'Motor hızını ne belirler?', options: ['AC frekansı', 'Kablo kalınlığı', 'Lastik basıncı'], answer: 0 },
  { type: 'part', q: 'Prizden gelen AC\'yi DC\'ye çeviren üniteye tıkla.', answer: 'obc' },
  { type: 'mc', q: 'Bataryaya müdahaleden önce ilk adım?', options: ['MSD çek, eldiven tak', 'Motoru çalıştır', 'Suyla temizle'], answer: 0 },
];
