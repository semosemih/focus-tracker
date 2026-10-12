/**
 * MOMENTUM - Sabitler & Başlangıç Konfigürasyonları
 */

const COLOR_PALETTE = [
  { name: 'Adaçayı / Matcha', hex: '#3ecf8e' },
  { name: 'Lavanta / İndigo', hex: '#7c8cf8' },
  { name: 'Bal Kehribar', hex: '#eab308' },
  { name: 'Gül Kurusu / Terracotta', hex: '#e06c75' },
  { name: 'Sisli Okyanus', hex: '#38bdf8' },
  { name: 'Sakin Leylak', hex: '#a78bfa' },
  { name: 'Duman Grisi', hex: '#94a3b8' },
  { name: 'Sıcak Şeftali / Kil', hex: '#fb923c' }
];

const EMOJI_LIST = [
  // Hızlı & Genel
  '⚡', '🎯', '🔥', '✨', '🚀', '💡', '☕',
  // Spor & Egzersiz (Yürüyüş, Yüzme, Kalisteniks, Halter, vb.)
  '🏃‍♂️', '🚶‍♂️', '🏊‍♂️', '🤸‍♂️', '🏋️‍♂️', '🧗‍♂️', '🚴‍♂️', '🧘‍♂️', '🥊', '⚽', '💪',
  // Müzik & Enstrümanlar (Davul, Piyano, Gitar, vb.)
  '🥁', '🎹', '🎸', '🎻', '🎙️', '🎵', '🎧',
  // Diller & Bayraklar (İngilizce, Almanca, vb.)
  '🇬🇧', '🇩🇪', '🇯🇵', '🇹🇷', '✍️',
  // Tarih, Antik & Zihin
  '🏛️', '📜', '⏳', '🧠', '📚', '📖', '💻', '🎨', '🔬', '🔭',
  // Tatlı Böcekler & Doğa
  '🐞', '🌿', '🌱', '👑'
];

const DEFAULT_ITEMS = {
  spor: [
    { id: 'spor-1', category: 'spor', title: 'Kardiyo & Koşu', emoji: '🏃‍♂️', color: '#3ecf8e', sessionsCount: 0, totalMinutes: 0 },
    { id: 'spor-2', category: 'spor', title: 'Kuvvet & Ağırlık', emoji: '💪', color: '#38bdf8', sessionsCount: 0, totalMinutes: 0 },
    { id: 'spor-3', category: 'spor', title: 'Esneme & Mobilite', emoji: '🧘‍♂️', color: '#3ecf8e', sessionsCount: 0, totalMinutes: 0 },
    { id: 'spor-4', category: 'spor', title: 'Bisiklet & Yürüyüş', emoji: '🚴‍♂️', color: '#38bdf8', sessionsCount: 0, totalMinutes: 0 }
  ],
  ders: [
    { id: 'ders-1', category: 'ders', title: 'Matematik & Analiz', emoji: '🧠', color: '#7c8cf8', sessionsCount: 0, totalMinutes: 0 },
    { id: 'ders-2', category: 'ders', title: 'Kodlama & Proje', emoji: '💻', color: '#a78bfa', sessionsCount: 0, totalMinutes: 0 },
    { id: 'ders-3', category: 'ders', title: 'İngilizce / Dil', emoji: '✍️', color: '#38bdf8', sessionsCount: 0, totalMinutes: 0 },
    { id: 'ders-4', category: 'ders', title: 'Kitap Okuma', emoji: '📖', color: '#eab308', sessionsCount: 0, totalMinutes: 0 }
  ],
  yaraticilik: [
    { id: 'yar-1', category: 'yaraticilik', title: 'Çizim & Tasarım', emoji: '🎨', color: '#eab308', sessionsCount: 0, totalMinutes: 0 },
    { id: 'yar-2', category: 'yaraticilik', title: 'Müzik & Enstrüman', emoji: '🎵', color: '#fb923c', sessionsCount: 0, totalMinutes: 0 },
    { id: 'yar-3', category: 'yaraticilik', title: 'Yaratıcı Yazarlık', emoji: '✍️', color: '#e06c75', sessionsCount: 0, totalMinutes: 0 },
    { id: 'yar-4', category: 'yaraticilik', title: 'Fikir & Beyin Fırtınası', emoji: '💡', color: '#a78bfa', sessionsCount: 0, totalMinutes: 0 }
  ]
};

const MOTIVATION_QUOTES = [
  "Disiplin, ne istediğin ile şu an ne istediğin arasındaki seçimdir.",
  "Büyük başarılar, her gün tekrarlanan küçük disiplinlerin toplamıdır.",
  "Başlamak için mükemmel olmak zorunda değilsin, ama mükemmel olmak için başlamak zorundasın.",
  "Bugün kendine ayırdığın bu zaman, gelecekteki benliğine en büyük armağanın.",
  "Zor olan başlamaktır, başladıktan sonra momentum seni taşır.",
  "Tutarlılık, sıradanlığı ustalığa dönüştüren gizli güçtür.",
  "Kendini fethettiğin her an, dünyayı fethetmeye bir adım daha yaklaşırsın.",
  "Zihnin durmak istediğinde bir adım daha at; gerçek gelişim o eşikte başlar.",
  "Sessizce ve derinden çalış, gürültüyü başarın çıkarsın.",
  "Her seans, olmak istediğin insanın heykeline vurulan usta bir çekiç darbesidir."
];

window.MomentumConstants = {
  COLOR_PALETTE,
  EMOJI_LIST,
  DEFAULT_ITEMS,
  MOTIVATION_QUOTES
};
