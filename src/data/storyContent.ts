import { StoryNode, Enemy, Skill, Item, GameClass, AttributeStats } from '../types';

export const CLASS_DETAILS: Record<GameClass, {
  description: string;
  baseStats: AttributeStats;
  skills: Skill[];
  color: string;
}> = {
  'Star Knight': {
    description: 'Petarung jarak dekat tangguh yang menguasai pedang plasma dan taktik taktis. Memiliki HP dan kekuatan fisik tinggi.',
    baseStats: { strength: 8, intelligence: 3, vitality: 7, agility: 4 },
    skills: [
      { id: 'sk_blade', name: 'Saber Cyclone', description: 'Serangan pedang berputar yang menebas musuh dengan energi kinetik hebat.', energyCost: 15, cooldown: 0, currentCooldown: 0, type: 'damage', element: 'kinetic', power: 1.5 },
      { id: 'sk_shield', name: 'Sunshield Charge', description: 'Maju menghantam musuh sekaligus memberikan perisai energi penyerap luka.', energyCost: 20, cooldown: 2, currentCooldown: 0, type: 'buff', element: 'shield', power: 30 }
    ],
    color: '#3b82f6'
  },
  'Void Mage': {
    description: 'Ilmuwan mistis yang memanipulasi energi ketiadaan (void) dan memanipulasi gravitasi. Energi tinggi namun rapuh.',
    baseStats: { strength: 2, intelligence: 9, vitality: 3, agility: 6 },
    skills: [
      { id: 'vm_singularity', name: 'Singularitas Void', description: 'Menciptakan lubang hitam mini yang menghisap energi material musuh.', energyCost: 25, cooldown: 0, currentCooldown: 0, type: 'damage', element: 'void', power: 1.8 },
      { id: 'vm_drain', name: 'Siphon Nebula', description: 'Menyedot partikel kehidupan musuh untuk memulihkan HP Anda sendiri.', energyCost: 20, cooldown: 3, currentCooldown: 0, type: 'heal', element: 'void', power: 1.2 }
    ],
    color: '#8b5cf6'
  },
  'Aegis Sentinel': {
    description: 'Benteng berjalan dengan baju zirah masif. Mengutamakan pertahanan mutlak, pemulihan, dan serangan balik.',
    baseStats: { strength: 5, intelligence: 4, vitality: 9, agility: 2 },
    skills: [
      { id: 'as_fortify', name: 'Protokol Fortifikasi', description: 'Mengaktifkan magnet nano untuk meningkatkan pertahanan dan meregenerasi HP.', energyCost: 15, cooldown: 3, currentCooldown: 0, type: 'heal', element: 'shield', power: 1.4 },
      { id: 'as_smash', name: 'Meteor Crash', description: 'Melompat bebas dan menghantamkan tameng berat ke tanah, melukai musuh.', energyCost: 20, cooldown: 1, currentCooldown: 0, type: 'damage', element: 'kinetic', power: 1.3 }
    ],
    color: '#10b981'
  },
  'Chrono Scout': {
    description: 'Penjelajah hiper-cepat yang memanipulasi garis waktu taktis. Bergerak lincah dengan akurasi mematikan.',
    baseStats: { strength: 4, intelligence: 5, vitality: 4, agility: 9 },
    skills: [
      { id: 'cs_warp', name: 'Lompatan Waktu', description: 'Mempercepat frekuensi selular untuk melakukan aksi ekstra secara cepat.', energyCost: 18, cooldown: 2, currentCooldown: 0, type: 'buff', element: 'void', power: 1.2 },
      { id: 'cs_precision', name: 'Tembakan Presisi', description: 'Mencari kelemahan fatal musuh lalu melepaskan muatan laser terfokus kabut.', energyCost: 22, cooldown: 0, currentCooldown: 0, type: 'damage', element: 'laser', power: 1.6 }
    ],
    color: '#fb7185'
  }
};

export const DEFAULT_ITEMS: Item[] = [
  { id: 'item_medpack', name: 'Nano-Medpack', description: 'Teknologi medis molekuler. Menyembuhkan 60 HP seketika.', type: 'heal_hp', value: 60, quantity: 2, icon: 'HeartPulse' },
  { id: 'item_plasma', name: 'Sel Plasma Biru', description: 'Mengisi ulang pasokan energi internal setinggi 40 Poin.', type: 'heal_energy', value: 40, quantity: 2, icon: 'Zap' },
  { id: 'item_grenade', name: 'Granat Elektrik', description: 'Meledakkan sirkuit musuh dengan kejutan emp, memberikan 45 Damage.', type: 'grenade', value: 45, quantity: 1, icon: 'Bomb' }
];

export const ENEMIES_DATA: Record<string, Enemy> = {
  'android_sentry': {
    id: 'android_sentry',
    name: 'Nexus Security Guard v.4',
    level: 2,
    maxHp: 80,
    hp: 80,
    attack: 8,
    speed: 5,
    spriteSeed: 'android',
    colorTheme: '#64748b',
    skills: [
      { name: 'Overcharge Laser', damage: 13, frequency: 0.4 },
      { name: 'Tembakan Standar', damage: 8, frequency: 0.6 }
    ],
    description: 'Unit patroli otomatis milik Syndicate. Memiliki meriam laser cepat di lengan kanannya.'
  },
  'void_phantom': {
    id: 'void_phantom',
    name: 'Void Glimmer Shrouding',
    level: 2,
    maxHp: 70,
    hp: 70,
    attack: 11,
    speed: 7,
    spriteSeed: 'phantom',
    colorTheme: '#a855f7',
    skills: [
      { name: 'Genggaman Void', damage: 16, frequency: 0.5 },
      { name: 'Kutukan Nebula', damage: 10, frequency: 0.5 }
    ],
    description: 'Entitas spektral yang terbentuk akibat kebocoran radiasi bintang kuno di Sektor Gelap.'
  },
  'renegade_scout': {
    id: 'renegade_scout',
    name: 'Pembelot Sabotir Syndicate',
    level: 3,
    maxHp: 95,
    hp: 95,
    attack: 10,
    speed: 8,
    spriteSeed: 'siren',
    colorTheme: '#fb923c',
    skills: [
      { name: 'Pisau Termal', damage: 14, frequency: 0.5 },
      { name: 'Senapang Pulse', damage: 9, frequency: 0.5 }
    ],
    description: 'Mantan tentara elit yang sekarang memimpin kelompok anarkis pencari kekuasaan.'
  },
  // Final Bosses
  'core_behemoth': {
    id: 'core_behemoth',
    name: 'Apex Core-Devourer Behemoth',
    level: 5,
    maxHp: 200,
    hp: 200,
    attack: 16,
    speed: 4,
    spriteSeed: 'behemoth',
    colorTheme: '#f43f5e',
    skills: [
      { name: 'Asteroid Cataclysm', damage: 24, frequency: 0.3 },
      { name: 'Tepukan Gempa Bintang', damage: 16, frequency: 0.7 }
    ],
    description: 'Mesin mengerikan milik jenderal utama Syndicate. Berfungsi menguras langsung energi inti bintang tanpa peduli hancurnya sistem.'
  },
  'sentinel_commander': {
    id: 'sentinel_commander',
    name: 'Komandan Malakor (Aegis Berserk)',
    level: 5,
    maxHp: 220,
    hp: 220,
    attack: 14,
    speed: 3,
    spriteSeed: 'siren',
    colorTheme: '#10b981',
    skills: [
      { name: 'Tsunami Gravitasi Tameng', damage: 22, frequency: 0.4 },
      { name: 'Eksekusi Keadilan', damage: 15, frequency: 0.6 }
    ],
    description: 'Komandan perang ekstremis dari pihak Pemberontak yang menghalalkan segala cara, termasuk mengebom kubah pengungsi sipil.'
  },
  'void_kraken': {
    id: 'void_kraken',
    name: 'Leviathan Void Kuno',
    level: 6,
    maxHp: 240,
    hp: 240,
    attack: 18,
    speed: 6,
    spriteSeed: 'phantom',
    colorTheme: '#c084fc',
    skills: [
      { name: 'Meteor Sunyi Ketiadaan', damage: 28, frequency: 0.3 },
      { name: 'Tentakel Nebula', damage: 15, frequency: 0.7 }
    ],
    description: 'Makhluk purba kosmik penjaga keseimbangan galaksi yang marah besar karena pengeboran ilegal merusak tidur lelapnya.'
  }
};

export const STORY_NODES: Record<string, StoryNode> = {
  'start': {
    id: 'start',
    title: 'Terbangun di Kapal Vanguard',
    location: 'Dek Hanggar, Rogue Ship Vanguard',
    backgroundType: 'space_bridge',
    text: 'Dalam kesunyian hampa, mata Anda perlahan membuka. Alarm merah di kapal penyelamat "Vanguard" berkedip lemah. Anda adalah korban selamat dari pemusnahan koloni kecil oleh armada tambang Syndicate.\n\nSebuah transmisi masuk berdering di konsol holografik depan Anda: Kapten Drake dari Aliansi Pemberontak mencoba menghubungi Anda. Namun, sinyal sub-space resmi milik korporat Syndicate juga mendengung keras, menuntut kepatuhan identifikasi.',
    choices: [
      {
        text: 'Buka transmisi Kapten Drake (Rebel)',
        leadsTo: 'rebel_intro',
        alignmentImpact: { rebel: 10, syndicate: 0 },
        expReward: 15,
        creditsReward: 100
      },
      {
        text: 'Balas panggilan patroli Syndicate',
        leadsTo: 'syndicate_intro',
        alignmentImpact: { rebel: 0, syndicate: 10 },
        expReward: 15,
        creditsReward: 250 // Corporate pays upfront
      },
      {
        text: '[CHRONO SCOUT / VOID MAGE] Retas enkripsi rahasia di sistem navigasi',
        leadsTo: 'void_intro',
        requiredClass: 'Chrono Scout', // We will accept Chrono Scout or Void Mage programmatically in code, metadata checks
        expReward: 25,
        creditsReward: 150
      },
      {
        // Fallback or secondary role choice
        text: '[VOID MAGE] Salami frekuensi tak kasat mata di anomali sekitar',
        leadsTo: 'void_intro',
        requiredClass: 'Void Mage',
        expReward: 25
      }
    ]
  },

  // REBEL ROUTE
  'rebel_intro': {
    id: 'rebel_intro',
    title: 'Panggilan Kapten Drake',
    location: 'Dek Sinyal, Vanguard',
    backgroundType: 'nebula_deck',
    text: '"Senang melihatmu masih bernyawa," suara berat Kapten Drake muncul dalam wujud hologram hijau yang bergetar. "Syndicate sedang menyedot inti matahari sistem Omega ini. Jika mereka dibiarkan, bintang ini akan meledak dalam hitungan hari. Kami butuh agen yang berani menyusup ke tambang asteroid mereka.\n\nSatu detasemen robot keamanan Syndicate sudah mendarat di luar hanggarmu. Kita harus menghancurkan sirkuit pengawas mereka sebelum kamu bisa kabur!"',
    choices: [
      {
        text: 'Maju hadapi unit keamanan Syndicate! [Pertarungan Turn-Based]',
        leadsTo: 'COMBAT:android_sentry:rebel_post_combat',
        expReward: 20
      },
      {
        text: 'Gunakan taktik gerilya untuk mengejutkan mereka (Butuh 150 Credits untuk membeli amunisi kejut)',
        leadsTo: 'rebel_surprise_attack',
        requiredCredits: 150,
        expReward: 40
      }
    ]
  },
  'rebel_surprise_attack': {
    id: 'rebel_surprise_attack',
    title: 'Penyergapan Taktis',
    location: 'Lorong Ventilasi Hanggar',
    backgroundType: 'star_station',
    text: 'Anda membeli muatan peledak khusus dari terminal kapal Vanguard dan menyelinap melalui pipa pembuangan panas. Di bawah, robot penjaga Nexus berdiri tanpa curiga.\n\nBOM! ledakan emp merusak prosesor utama robot itu hingga hancur berkeping-keping tanpa perlawanan. Anda menemukan modul data penting dan modul energi tambahan di bangkai logam tersebut!',
    choices: [
      {
        text: 'Lanjutkan perjalanan ke Markas Pemberontak',
        leadsTo: 'rebel_outpost',
        creditsReward: 200,
        itemReward: { id: 'item_plasma', name: 'Sel Plasma Biru', description: 'Mengisi ulang pasokan energi internal setinggi 40 Poin.', type: 'heal_energy', value: 40, quantity: 1, icon: 'Zap' }
      }
    ]
  },
  'rebel_post_combat': {
    id: 'rebel_post_combat',
    title: 'Kemenangan di Dek Hanggar',
    location: 'Dek Hanggar Vanguard',
    backgroundType: 'star_station',
    text: 'Robot penjaga roboh dengan percikan listrik biru. Kapten Drake mengangguk terkesan dari layar terminal. "Luar biasa! Kamu memiliki insting petarung sejati. Koordinat rahasia pangkalan kami di Asteroid Ceres telah dikirimkan ke kapalmu. Bertemu denganku di sana."',
    choices: [
      {
        text: 'Terbangkan kapal Vanguard ke Pangkalan Ceres',
        leadsTo: 'rebel_outpost',
        creditsReward: 150,
        itemReward: { id: 'item_medpack', name: 'Nano-Medpack', description: 'Teknologi medis molekuler. Menyembuhkan 60 HP seketika.', type: 'heal_hp', value: 60, quantity: 1, icon: 'HeartPulse' }
      }
    ]
  },
  'rebel_outpost': {
    id: 'rebel_outpost',
    title: 'Surga Pemberontak: Ceres',
    location: 'Kubah Rahasia Ceres',
    backgroundType: 'ancient_temple',
    text: 'Pangkalan Ceres adalah kubah bawah tanah penuh sesak pengungsi perang kosmik. Kapten Drake menyambut Anda dengan jabat tangan hangat. "Laporan intelijen terbaru sangat mengerikan. Syndicate telah merancang robot raksasa bernama \'Core-Devourer Behemoth\' untuk menyelesaikan penyedotan bintang Omega.\n\nNamun, kami menangkap sinyal bahwa salah satu Komandan kami, Malakor, telah bertindak radikal. Dia berniat meledakkan pangkalan tempat tinggal sipil Syndicate demi membalas dendam. Kamu harus menghentikan rencana gila ini sebelum ribuan nyawa tak berdosa melayang, atau membiarkannya demi kehancuran korporasi."',
    choices: [
      {
        text: 'Hentikan rencana radikal Malakor. Sipil tidak bersalah! (Pemberontak Sejati)',
        leadsTo: 'rebel_stop_malakor',
        alignmentImpact: { rebel: 30, syndicate: -10 }
      },
      {
        text: 'Dukung Malakor. Demi mengalahkan Syndicate, semua pengorbanan dihalalkan.',
        leadsTo: 'rebel_join_extremism',
        alignmentImpact: { rebel: -20, syndicate: -30 }
      }
    ]
  },
  'rebel_stop_malakor': {
    id: 'rebel_stop_malakor',
    title: 'Menembus Sektor Komando',
    location: 'Sektor Reaktor Pangkalan Ceres',
    backgroundType: 'void_rift',
    text: 'Anda menyergap Komandan Malakor tepat saat dia memasang detonator antimateri. "Singkirkan senjatamu!" teriak Malakor marah. "Mereka merebut keluargaku! Menyelamatkan sipil musuh adalah pengkhianatan!"\n\nDia mengayunkan tameng meteor besarnya. Pertempuran demi masa depan moral aliansi dimulai!',
    choices: [
      {
        text: 'Lawan Komandan Malakor yang mengamuk! [Pertarungan Bos]',
        leadsTo: 'COMBAT:sentinel_commander:battle_malakor_win'
      }
    ]
  },
  'battle_malakor_win': {
    id: 'battle_malakor_win',
    title: 'Jiwa Aliansi Terselamatkan',
    location: 'Sektor Reaktor Ceres',
    backgroundType: 'ancient_temple',
    text: 'Komandan Malakor terengah-engah di lantai, tamengnya terbelah. Dia akhirnya menyadari kegilaannya dan menyerahkan detonator tersebut.\n\nKapten Drake mendarat tepat waktu. "Kamu membuktikan bahwa Aliansi ini bertarung demi kehidupan, bukan kebencian. Sekarang, hanya ada satu rintangan tersisa: Core-Devourer Behemoth milik Syndicate di Jantung Bintang Omega harus dihancurkan sebelum melumat tata surya ini!"',
    choices: [
      {
        text: 'Terbangkan kapal langsung ke Jantung Bintang Omega [Final Battle]',
        leadsTo: 'COMBAT:core_behemoth:ending_rebel_good'
      }
    ]
  },
  'rebel_join_extremism': {
    id: 'rebel_join_extremism',
    title: 'Hujan Api Kosmik',
    location: 'Sektor Komando Ceres',
    backgroundType: 'void_rift',
    text: 'Anda membiarkan Malakor memicu detonator tersebut. Kubah logistik pertambangan Syndicate meledak dalam lingkaran api nuklir hijau besar. Ribuan tentara dan sipil tewas seketika, melumpuhkan total ekonomi Syndicate.\n\nNamun, di tengah puing reruntuhan, robot otomatis penjaga bintang Omega, Core-Devourer Behemoth, dipisahkan dari pasokan listrik dan berguncang liar tak terkendali menuju zona kehampaan yang dapat menelan segalanya. Anda melompat ke kapal untuk meredam bencana kegelapan!',
    choices: [
      {
        text: 'Masuki badai bintang untuk menghabisi Behemoth [Final Battle]',
        leadsTo: 'COMBAT:core_behemoth:ending_rebel_dark'
      }
    ]
  },

  // SYNDICATE ROUTE
  'syndicate_intro': {
    id: 'syndicate_intro',
    title: 'Tawaran Korporasi',
    location: 'Menara Komunikasi Sektor Delta',
    backgroundType: 'star_station',
    text: 'Konsol Anda memproyeksikan lambang emas bersinar khas Syndicate. Suara dingin Direktur Vane terdengar: "Kami mendeteksi aktivitas kapal liar Vanguard. Anda mengendarai aset sitaan milik korporasi kami. Kami bersedia melupakan kejahatan Anda, bahkan memberi Anda posisi elit di armada keamanan, jika Anda membersihkan unit sabotase pemberontak yang merayap di Sektor Komando ini.\n\nMata-mata kami melaporkan ada penyusup Aliansi Pemberontak sedang merusak pengatur gravitasi pelabuhan kita!"',
    choices: [
      {
        text: 'Sapu bersih penyusup Pemberontak! [Pertarungan Turn-Based]',
        leadsTo: 'COMBAT:renegade_scout:syndicate_post_combat',
        expReward: 20
      },
      {
        text: 'Bujuk penyusup untuk mundur (Butuh Keahlian [STAR KNIGHT] atau suap 100 Credits)',
        leadsTo: 'syndicate_bribe',
        requiredClass: 'Star Knight',
        expReward: 35
      },
      {
        text: 'Bakar kabel pelabuhan dari jarak jauh untuk memojokkan mereka (Butuh 100 Credits untuk membeli alat korsleting)',
        leadsTo: 'syndicate_bribe',
        requiredCredits: 100,
        expReward: 25
      }
    ]
  },
  'syndicate_bribe': {
    id: 'syndicate_bribe',
    title: 'Resolusi Tanpa Darah',
    location: 'Ruang Distribusi Sektor Delta',
    backgroundType: 'nebula_deck',
    text: 'Menggunakan pemahaman militer Anda sebagai Star Knight, atau dengan menyuap sirkuit pengawas mereka menggunakan credits taktis, Anda berhasil memojokkan tim penyusup di ruang hampa udara. Menghadapi ancaman dibuang ke luar angkasa, mereka menyerah, mengembalikan chip data navigasi rahasia milik Syndicate.',
    choices: [
      {
        text: 'Kembalikan chip data ke Direktur Vane',
        leadsTo: 'syndicate_hq',
        creditsReward: 300,
        itemReward: { id: 'item_medpack', name: 'Nano-Medpack', description: 'Teknologi medis molekuler. Menyembuhkan 60 HP seketika.', type: 'heal_hp', value: 60, quantity: 1, icon: 'HeartPulse' }
      }
    ]
  },
  'syndicate_post_combat': {
    id: 'syndicate_post_combat',
    title: 'Laporan Keamanan Sektor Delta',
    location: 'Pusat Keamanan Sektor Delta',
    backgroundType: 'space_bridge',
    text: 'Pemimpin sabotir pemberontak roboh di dek baja. Direktur Vane tersenyum puas. "Efisiensi yang luar biasa. Anda terbukti memiliki nilai investasi tinggi. Sebagai upah, kami mengundang Anda ke markas terapung kami di Sektor Helios. Armada kami akan melindungimu dari murka pemberontak."',
    choices: [
      {
        text: 'Pergi ke Markas Helios Syndicate',
        leadsTo: 'syndicate_hq',
        creditsReward: 300,
        itemReward: { id: 'item_plasma', name: 'Sel Plasma Biru', description: 'Mengisi ulang pasokan energi internal setinggi 40 Poin.', type: 'heal_energy', value: 40, quantity: 2, icon: 'Zap' }
      }
    ]
  },
  'syndicate_hq': {
    id: 'syndicate_hq',
    title: 'Gemerlap Menara Helios',
    location: 'Menara Komando Helios',
    backgroundType: 'nebula_deck',
    text: 'Sektor Helios berkilau megah dengan kekayaan kosmik tak tertandingi. Namun, ketegangan sedang memuncak. Direktur Vane memanggil Anda secara pribadi. "Proyek penyedotan Int bintang Omega sudah 90% selesai. Namun, armada utama pemberontak yang dipimpin oleh komandan radikal mereka, Malakor, telah meluncurkan roket pembawa tameng magnetik besar untuk memblokade sistem pendingin kita.\n\nJika blokade tameng tersebut tidak dihentikan, reaktor kita akan meledak dan menghancurkan seluruh koloni pengungsi di planet tetangga. Kami menugaskan Anda mengemudikan Core-Devourer Behemoth untuk meledakkan jantung pertahanan Aliansi di orbit, menghabisi Malakor dan pasukannya!"',
    choices: [
      {
        text: 'Laksanakan tugas. Sukseskan ekstraksi bintang demi kemajuan sains korporat (Loyal Syndicate)',
        leadsTo: 'syndicate_execute_blockade',
        alignmentImpact: { rebel: -20, syndicate: 40 }
      },
      {
        text: 'Khianati Syndicate! Matikan sirkuit utama Behemoth dari dalam agar reaktor berhenti (Memihak Pemberontak di menit terakhir)',
        leadsTo: 'syndicate_betray_core',
        alignmentImpact: { rebel: 30, syndicate: -30 }
      }
    ]
  },
  'syndicate_execute_blockade': {
    id: 'syndicate_execute_blockade',
    title: 'Hempasan Badai Besi',
    location: 'Ruang Kokpit Apex Behemoth',
    backgroundType: 'void_rift',
    text: 'Anda menyatu secara saraf dengan kokpit raksasa Apex Behemoth. Menghadap armada Aliansi di garis depan, Anda menyaksikan Komandan Malakor berdiri gagah di anjungan kapal komandonya dengan tameng kosmik aktif.\n\n"Prajurit korporat jahanam!" maki Malakor lewat pancaran radio. "Hari ini kemandirian galaksi akan ditegakkan!"',
    choices: [
      {
        text: 'Hancurkan armada Malakor dengan senjata Behemoth! [Final Battle]',
        leadsTo: 'COMBAT:sentinel_commander:ending_syndicate_good'
      }
    ]
  },
  'syndicate_betray_core': {
    id: 'syndicate_betray_core',
    title: 'Sabotase Saraf Behemoth',
    location: 'Ruang Inti Behemoth',
    backgroundType: 'void_rift',
    text: 'Anda menyelinap ke terminal saraf purbakala di punggung Behemoth dan membebani sirkuit listriknya. Detonasi elektromagnetik meremukkan sistem pertahanan Behemoth, menghentikan pengeboran bintang! Namun, energi liar void yang bocor dari reaktor yang tidak stabil memanggil makhluk purba kosmik dari kegelapan dalam: Leviathan Void Kuno!\n\nMakhluk raksasa itu menembus robekan waktu dan menyerang kapal Anda!',
    choices: [
      {
        text: 'Gunakan seluruh senjata terbebas untuk melawan Leviathan Cosmic! [Final Battle]',
        leadsTo: 'COMBAT:void_kraken:ending_syndicate_betrayal'
      }
    ]
  },

  // VOID ROUTE (Neutral / Mystic)
  'void_intro': {
    id: 'void_intro',
    title: 'Anomali Enkripsi Purba',
    location: 'Dek Tengah, Vanguard',
    backgroundType: 'void_rift',
    text: 'Menggunakan manipulasi sirkuit taktis khas kelas mistis Anda, Anda menyedot frekuensi misterius dari puing-puing energi sekitar. Di layar, peta tata surya berguncang memunculkan koordinat tersembunyi berlabel "Situs Kuil Astraria".\n\nMateri kegelapan bergulung di luar kapal Vanguard. Perjalanan fajar kosmik terhambat oleh penampakan bayangan misterius: Void Glimmer Shroud yang melayang menembus perisai energi Vanguard!',
    choices: [
      {
        text: 'Pertahankan sistem kapal dari Void Glimmer! [Pertarungan Turn-Based]',
        leadsTo: 'COMBAT:void_phantom:void_post_combat',
        expReward: 20
      },
      {
        text: 'Gunakan resonansi anomali kosmik untuk mengusirnya (Butuh Keahlian [VOID MAGE] atau 100 Credits)',
        leadsTo: 'void_peaceful_resolve',
        requiredClass: 'Void Mage',
        expReward: 40
      }
    ]
  },
  'void_peaceful_resolve': {
    id: 'void_peaceful_resolve',
    title: 'Menjinakkan Ombak Void',
    location: 'Kamar Saraf Vanguard',
    backgroundType: 'void_rift',
    text: 'Sebagai Void Mage, Anda memusatkan pikiran ke dalam dimensi tanpa warna dan menyalurkan gelombang harmoni. Kegelapan di sekeliling kapal melunak. Void Glimmer tersebut perlahan meluruh, meninggalkan sekeping "Void Catalyst Core" berharga tinggi di konsol kapal Anda!',
    choices: [
      {
        text: 'Gunakan Koordinat Rahasia untuk Melompat ke Kuil Astraria',
        leadsTo: 'void_temple',
        creditsReward: 150,
        itemReward: { id: 'item_plasma', name: 'Sel Plasma Biru', description: 'Mengisi ulang pasokan energi internal setinggi 40 Poin.', type: 'heal_energy', value: 40, quantity: 2, icon: 'Zap' }
      }
    ]
  },
  'void_post_combat': {
    id: 'void_post_combat',
    title: 'Meredanya Badai Spektral',
    location: 'Ruang Generator Vanguard',
    backgroundType: 'star_station',
    text: 'Makhluk spektral tersebut meleleh menjadi butiran kabut ungu yang tersedot ke filter udara kabin. Berhasil bertahan, navigasi Vanguard terkunci ke target kosmik kuno: Kuil Pelindung Astraria yang melayang di dalam gelembung warp tersembunyi.',
    choices: [
      {
        text: 'Luncurkan Lompatan Warp ke Kuil Astraria',
        leadsTo: 'void_temple',
        creditsReward: 100,
        itemReward: { id: 'item_medpack', name: 'Nano-Medpack', description: 'Teknologi medis molekuler. Menyembuhkan 60 HP seketika.', type: 'heal_hp', value: 60, quantity: 1, icon: 'HeartPulse' }
      }
    ]
  },
  'void_temple': {
    id: 'void_temple',
    title: 'Kuil Astraria yang Terlupakan',
    location: 'Inti Suci Astraria',
    backgroundType: 'ancient_temple',
    text: 'Kuil kuno berbalut batu andesit kosmik berkilau dingin di hadapan Anda. Di tengah pedestal, terbaring ramalan prasasti: "Keseimbangan galaksi terancam saat raksasa besi mengebor jantung bintang Omega. Jika kedua faksi terus bertikai, monster void kuno yang murka akan melahap seisi tata surya."\n\nTiba-tiba, radar kapal memperingatkan Anda: Pertempuran besar faksi Aliansi (Rebel) dan Syndicate sedang pecah tepat di luar orbit kuil ini. Kedua kapal perang menembaki inti bintang Omega secara serampangan!',
    choices: [
      {
        text: 'Intervensi pertempuran. Lumpuhkan meriam energi kedua belah pihak secara adil demi Galaksi!',
        leadsTo: 'void_intervene',
        expReward: 50
      },
      {
        text: 'Biarkan mereka saling memusnahkan. Saatnya mencuri kekuatan energi bintang dari kuil ini untuk keuntungan pribadi!',
        leadsTo: 'void_selfish',
        expReward: 30
      }
    ]
  },
  'void_intervene': {
    id: 'void_intervene',
    title: 'Panggilan Keseimbangan Alam',
    location: 'Orbit Bintang Omega',
    backgroundType: 'void_rift',
    text: 'Anda menembakkan suar anoda rahasia dari kuil kuno untuk menghentikan tembakan liar kedua belah pihak. Terkejut, tembakan tidak stabil dari reaktor meledak di dekat zona Anda dan membangunkan badai terdalam: Kraken Void Kuno yang legendaris terbangun!\n\nDengan mata ultraviolet menyala-nyala, ia bermaksud merobek habis seluruh armada. Anda harus berjuang mengalahkannya demi menyelamatkan seisi galaksi!',
    choices: [
      {
        text: 'Lawan Leviathan Void Kuno! [Final Battle]',
        leadsTo: 'COMBAT:void_kraken:ending_void_savior'
      }
    ]
  },
  'void_selfish': {
    id: 'void_selfish',
    title: 'Kaisar Kegelapan Baru',
    location: 'Jantung Singgasana Astraria',
    backgroundType: 'ancient_temple',
    text: 'Anda menghiraukan perang di luar dan menyerap seluruh pilar plasma kosmik di kuil ke tubuh Anda. Otot dan pembuluh darah Anda dialiri kekuatan antimateri yang melelehkan batas-batas kemanusiaan.\n\nNamun, asimilasi energi ini mengacaukan gerbang penjaga dimensi. Void Glimmer raksasa melesat keluar, menuntut keseimbangan energi. Energi liar ini menantang kekuatan dewa baru Anda dalam pertarungan hidup mati!',
    choices: [
      {
        text: 'Hadapi bayangan hukuman dimensi Anda sendiri! [Final Battle]',
        leadsTo: 'COMBAT:void_kraken:ending_void_lord'
      }
    ]
  },

  // ENDINGS
  'ending_rebel_good': {
    id: 'ending_rebel_good',
    title: 'Bintang Baru Aliansi Ceres',
    location: 'Orbit Damai Bintang Omega',
    backgroundType: 'space_bridge',
    text: 'Core-Devourer Behemoth meledak berkeping-keping menjadi debu kosmik berpendar biru. Tambang Syndicate runtuh, membatalkan ekstraksi ilegal.\n\nKapten Drake menyambut kepulangan Anda dengan sorak-sorai seluruh penjuru Ceres. Berkat tindakan pahlawan Anda menyelamatkan warga sipil sekaligus membebaskan sistem Omega, Aliansi kini bangkit dengan bermartabat tinggi. Anda dinobatkan sebagai "Star Savior Pertama" dalam babak sejarah baru yang merdeka!\n\nTERIMA KASIH TELAH BERMAIN! Kisah Anda berakhir dengan kemenangan Moral & Kebebasan.',
    choices: [
      {
        text: 'Main Lagi (Reset Petualangan)',
        leadsTo: 'RESET'
      }
    ]
  },
  'ending_rebel_dark': {
    id: 'ending_rebel_dark',
    title: 'Pemenang di Atas Gurun Kosmik',
    location: 'Bangkai Sektor Orbit Delta',
    backgroundType: 'nebula_deck',
    text: 'Dengan hancurnya Apex Behemoth di badai api yang dipicu ledakan Malakor, dominasi Syndicate hancur berkeping-keping, namun setengah dari sistem Omega kini berupa sabuk asteroid hampa tanpa kehidupan.\n\nAnda memimpin Aliansi Pemberontak dengan gaya tangan besi baru bersama Malakor. Kemenangan mutlak diperoleh, diwarnai duka mendalam bagi moralitas alam. Galaksi berisik membicarakan penakluk kejam sepertimu di kursi kekuasaan baru.\n\nTERIMA KASIH TELAH BERMAIN! Kisah Anda berakhir dengan kemenangan Radikal.',
    choices: [
      {
        text: 'Main Lagi (Reset Petualangan)',
        leadsTo: 'RESET'
      }
    ]
  },
  'ending_syndicate_good': {
    id: 'ending_syndicate_good',
    title: 'Direktur Agung Sektor Helios',
    location: 'Kubah Menara Helios, Pusat Syndicate',
    backgroundType: 'space_bridge',
    text: 'Komandan Malakor terhempas dari orbit bersama blockade tamengnya. Dengan runtuhnya pertahanan utama Pemberontak, Syndicate berhasil merampungkan ekstraksi energi bintang Omega.\n\nDirektur Vane menganugerahi Anda kenaikan pangkat menjadi Komandan Tertinggi Keamanan Sektor Helios, lengkap dengan istana terapung dan kekayaan tanpa batas. Koloni-koloni kini tertib di bawah pengawasan ketat robotik Anda. Galaksi makmur secara terpaksa.\n\nTERIMA KASIH TELAH BERMAIN! Kisah Anda berakhir dengan kejayaan Finansial & Kedisiplinan Korporasi.',
    choices: [
      {
        text: 'Main Lagi (Reset Petualangan)',
        leadsTo: 'RESET'
      }
    ]
  },
  'ending_syndicate_betrayal': {
    id: 'ending_syndicate_betrayal',
    title: 'Pelarian di Lautan Nebula',
    location: 'Dek Kapal Vanguard Terlantar',
    backgroundType: 'nebula_deck',
    text: 'Setelah mengalahkan Leviathan Cosmic yang terbangun akibat ledakan Behemoth, Anda ditinggalkan sendirian di reruntuhan tak bernyawa. Baik Syndicate maupun Aliansi menandai Anda sebagai pengkhianat nomor satu galaksi.\n\nMembawa bahan bakar plasma tersisa, Anda meluncur ke nebula terdalam Sektor Omega. Menjadi buronan paling dicari namun bebas tanpa ikatan siapa pun. Kisah penjelajah bayangan legendaris baru saja dimulai!\n\nTERIMA KASIH TELAH BERMAIN! Kisah Anda berakhir dengan status Serigala Penyendiri.',
    choices: [
      {
        text: 'Main Lagi (Reset Petualangan)',
        leadsTo: 'RESET'
      }
    ]
  },
  'ending_void_savior': {
    id: 'ending_void_savior',
    title: 'Sang Penjaga Keseimbangan Kosmos',
    location: 'Singgasana Keseimbangan Astraria',
    backgroundType: 'ancient_temple',
    text: 'Sabetan pamungkas Anda membungkam teriakan Void Kraken. Makhluk purba tersebut berangsur pulih dan kembali tidur dalam harmonisasi kosmos. Terpana oleh fenomena dahsyat ini, baik Syndicate maupun Aliansi menyerukan gencatan senjata bersejarah untuk menyelidiki sains transendental di Astraria.\n\nAnda diangkat sebagai Pelindung Kuil Agung yang dipercaya memandu kedua fraksi dalam kemakmuran tanpa peperangan.\n\nTERIMA KASIH TELAH BERMAIN! Kisah Anda berakhir dengan perdamaian abadi.',
    choices: [
      {
        text: 'Main Lagi (Reset Petualangan)',
        leadsTo: 'RESET'
      }
    ]
  },
  'ending_void_lord': {
    id: 'ending_void_lord',
    title: 'Dewa Void yang Abadi',
    location: 'Kehampaan Kosmik',
    backgroundType: 'void_rift',
    text: 'Kekuatan antimateri Anda melumat penampakan bayangan dimensi tersebut. Anda melayang tinggi di angkasa, bukan lagi manusia tetapi sebuah rasi bintang berkesadaran tunggal yang menguasai ruang dan waktu.\n\nPerang faksi kecil di bawah terlihat seperti debu yang tiada artinya. Anda mengamati galaksi tumbuh dan runtuh dari ketenangan dimensi ketiadaan Anda sendiri.\n\nTERIMA KASIH TELAH BERMAIN! Kisah Anda berakhir dengan transendensi kosmik mutlak.',
    choices: [
      {
        text: 'Main Lagi (Reset Petualangan)',
        leadsTo: 'RESET'
      }
    ]
  }
};
