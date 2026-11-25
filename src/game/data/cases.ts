import type { MaterialId } from "./materials";

export type CaseId = MaterialId;
export type NpcId = "nara" | "ardi" | "dito" | "sasa";

export interface Clue {
  id: string;
  label: string;
  finding: string;
}

export interface Evidence {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  clues: Clue[];
  note: string;
}

export interface DecisionOption {
  id: "A" | "B" | "C";
  text: string;
  correct: boolean;
  feedback: string;
}

export interface CaseData {
  id: CaseId;
  number: number;
  code: string;
  title: string;
  threat: string;
  category: string;
  difficulty: "Mudah" | "Menengah";
  npc: NpcId;
  victim: string;
  location: string;
  chronology: string[];
  intro: string[];
  evidence: Evidence[];
  decision: { question: string; options: DecisionOption[] };
  report: { threat: string; cause: string; recommendations: string[] };
  debrief: string[];
}

export const EXP_PER_CASE = 100;

export const CASES: CaseData[] = [
  {
    id: "phishing",
    number: 1,
    code: "CASE 01",
    title: "The Phishing Attack",
    threat: "Phishing Attack",
    category: "Pencurian kredensial melalui phishing",
    difficulty: "Mudah",
    npc: "ardi",
    victim: "Ardi",
    location: "Kantor Pos Digital",
    chronology: [
      "Ardi menerima email yang menyebut akun DigiPass miliknya bermasalah.",
      "Email mengarahkan Ardi ke halaman login untuk \"verifikasi\".",
      "Ardi membuka tautan dan memasukkan username serta password.",
      "Beberapa saat kemudian, muncul notifikasi login dari perangkat yang tidak dikenal.",
    ],
    intro: [
      "Eh, kamu asisten baru Cyber Center, ya? Tolong aku!",
      "Tadi aku dapat email katanya akun DigiPass-ku bermasalah dan harus diverifikasi.",
      "Aku langsung klik tautannya dan login... terus muncul notifikasi ada yang masuk dari perangkat lain!",
      "Bukti-buktinya sudah kusimpan. Bisa bantu cari tahu apa yang terjadi?",
    ],
    evidence: [
      {
        id: "email",
        title: "Email Mencurigakan",
        subtitle: "Pesan \"verifikasi akun\" yang diterima Ardi",
        icon: "✉️",
        clues: [
          { id: "sender", label: "Alamat pengirim", finding: "Pengirim memakai domain digipass-verifikasi.com, bukan domain resmi digipass.id." },
          { id: "pressure", label: "Isi pesan", finding: "Pesan memakai ancaman \"diblokir dalam 24 jam\" agar korban panik dan tidak berpikir panjang." },
          { id: "login", label: "Permintaan login", finding: "Email meminta username dan password lewat tautan. Layanan resmi tidak meminta password melalui email." },
        ],
        note: "Email berasal dari domain palsu, memakai tekanan waktu, dan meminta informasi login.",
      },
      {
        id: "url",
        title: "Alamat Situs",
        subtitle: "Perbandingan situs resmi dan situs dari email",
        icon: "🌐",
        clues: [
          { id: "domain", label: "Nama domain", finding: "Domainnya berbeda: digipass-verifikasi.com ≠ digipass.id. Menambah kata seperti \"verifikasi\" adalah trik umum phishing." },
          { id: "look", label: "Tampilan halaman", finding: "Logo dan warna halaman palsu dibuat sangat mirip. Tampilan tidak bisa dijadikan patokan — periksa alamatnya." },
          { id: "https", label: "Tanda keamanan", finding: "Halaman palsu tidak memakai HTTPS. Tapi ingat: ikon gembok saja tidak menjamin situs asli, tetap cek nama domain." },
        ],
        note: "Halaman login yang dibuka Ardi adalah situs tiruan dengan domain berbeda dari situs resmi.",
      },
      {
        id: "loginlog",
        title: "Riwayat Login",
        subtitle: "Aktivitas login akun DigiPass Ardi",
        icon: "🧾",
        clues: [
          { id: "unknown", label: "Perangkat asing", finding: "Ada login berhasil dari \"Windows PC\" di kota lain yang tidak dikenali Ardi." },
          { id: "timing", label: "Waktu kejadian", finding: "Login asing terjadi hanya 9 menit setelah Ardi mengisi halaman palsu — kredensialnya kemungkinan besar sudah dicuri." },
        ],
        note: "Pelaku sudah memakai kredensial Ardi untuk masuk dari perangkat yang tidak dikenal.",
      },
    ],
    decision: {
      question: "Apa tindakan yang paling tepat dilakukan Ardi setelah mengetahui akun dan kredensialnya mungkin telah dicuri?",
      options: [
        {
          id: "A",
          text: "Membalas email dan meminta penjelasan kepada pengirim.",
          correct: false,
          feedback: "Kurang tepat. Pengirim email adalah pelaku phishing. Membalas justru memberi tahu bahwa alamat email Ardi aktif dan membuka peluang tipuan lanjutan. Hubungi layanan hanya melalui kanal resmi.",
        },
        {
          id: "B",
          text: "Mengakses layanan melalui kanal resmi, segera mengamankan akun, mengganti password, dan memeriksa sesi login.",
          correct: true,
          feedback: "Tepat! Ketik sendiri alamat resmi atau buka aplikasi resminya, ganti password, keluarkan sesi yang tidak dikenal, lalu aktifkan 2FA. Jika password yang sama dipakai di layanan lain, ganti juga di sana.",
        },
        {
          id: "C",
          text: "Mengabaikan pemberitahuan aktivitas login.",
          correct: false,
          feedback: "Kurang tepat. Mengabaikan notifikasi memberi waktu kepada pelaku untuk mengganti password, mencuri data, atau menipu teman-teman Ardi. Notifikasi login asing harus segera ditindaklanjuti.",
        },
      ],
    },
    report: {
      threat: "Phishing",
      cause: "Kredensial dimasukkan ke halaman login yang tidak terverifikasi.",
      recommendations: [
        "Amankan akun melalui kanal resmi.",
        "Ganti password dengan yang kuat dan unik.",
        "Cabut sesi login yang tidak dikenal.",
        "Aktifkan autentikasi dua faktor (2FA).",
      ],
    },
    debrief: [
      "Kerja bagus! Ardi sudah mengamankan akunnya lewat aplikasi resmi.",
      "Ingat: phishing menang kalau kita panik. Selalu cek alamat pengirim dan domain situs sebelum login.",
      "Kasus berikutnya sudah menunggu. Dito di Gedung Keamanan Akun kehilangan akses ke akun media sosialnya.",
    ],
  },
  {
    id: "takeover",
    number: 2,
    code: "CASE 02",
    title: "Account Takeover",
    threat: "Account Takeover",
    category: "Pengambilalihan akun",
    difficulty: "Menengah",
    npc: "dito",
    victim: "Dito",
    location: "Gedung Keamanan Akun",
    chronology: [
      "Dito tidak bisa masuk ke akun media sosial Instagram miliknya.",
      "Email pemulihan akunnya ternyata sudah berubah.",
      "Ada aktivitas login yang tidak ia kenali.",
      "Dito memakai password yang sama di beberapa layanan dan pernah membagikan kode verifikasi kepada seseorang yang mengaku petugas bantuan.",
    ],
    intro: [
      "Halo... aku Dito. Akun Instagram-ku tidak bisa dibuka sejak tadi pagi.",
      "Password-ku ditolak, dan email pemulihannya bukan punyaku lagi!",
      "Kemarin malam ada \"petugas bantuan\" yang minta kode verifikasi... apa itu ada hubungannya?",
      "Tolong periksa catatan akunku, ya.",
    ],
    evidence: [
      {
        id: "loginlog",
        title: "Riwayat Login",
        subtitle: "Aktivitas login akun Instagram Dito",
        icon: "🧾",
        clues: [
          { id: "night", label: "Login dini hari", finding: "Ada login berhasil pukul 02:14 dari perangkat dan lokasi yang tidak pernah dipakai Dito." },
          { id: "multi", label: "Beberapa perangkat", finding: "Dua perangkat asing masuk berturut-turut dalam beberapa menit — tanda akun sedang dikuasai orang lain." },
        ],
        note: "Akun Dito diakses oleh perangkat asing pada dini hari.",
      },
      {
        id: "settings",
        title: "Pengaturan Akun",
        subtitle: "Perubahan data akun yang tidak dilakukan Dito",
        icon: "⚙️",
        clues: [
          { id: "recovery", label: "Email pemulihan", finding: "Email pemulihan diganti ke alamat asing. Dengan ini pelaku bisa mengunci Dito dari akunnya sendiri." },
          { id: "password", label: "Password diubah", finding: "Password diubah 3 menit setelah email pemulihan diganti — pelaku mengambil alih akun sepenuhnya." },
        ],
        note: "Pelaku mengganti email pemulihan dan password tanpa sepengetahuan Dito.",
      },
      {
        id: "security",
        title: "Riwayat Keamanan",
        subtitle: "Catatan OTP dan penggunaan password",
        icon: "🛡️",
        clues: [
          { id: "fake", label: "Petugas palsu", finding: "Akun \"Instagram Support\" di chat bukan akun resmi. Petugas resmi tidak pernah meminta kode OTP." },
          { id: "otp", label: "OTP dibagikan", finding: "Dito membagikan kode OTP. Kode inilah yang dipakai pelaku untuk menembus verifikasi." },
          { id: "reuse", label: "Password berulang", finding: "Password yang sama dipakai di 3 layanan, dan salah satunya pernah mengalami kebocoran data." },
        ],
        note: "Kode OTP dibagikan ke petugas palsu dan password yang sama dipakai di banyak layanan.",
      },
    ],
    decision: {
      question: "Bagaimana langkah terbaik untuk membantu Dito mengamankan kembali akunnya?",
      options: [
        {
          id: "A",
          text: "Menggunakan fitur pemulihan akun resmi, mengamankan email terkait, mengganti password dengan password unik, dan mengaktifkan 2FA.",
          correct: true,
          feedback: "Tepat! Pemulihan resmi adalah jalan aman untuk merebut kembali akun. Amankan juga email Dito, ganti semua password yang sama dengan password unik, dan aktifkan 2FA agar kejadian ini tidak terulang.",
        },
        {
          id: "B",
          text: "Membuat akun baru tanpa mengamankan akun lama.",
          correct: false,
          feedback: "Kurang tepat. Akun lama tetap dikuasai pelaku dan bisa dipakai untuk menipu teman-teman Dito atau menyalahgunakan data pribadinya. Password yang bocor juga masih mengancam layanan lain.",
        },
        {
          id: "C",
          text: "Memberikan kode OTP kepada orang yang mengaku dapat mengembalikan akun.",
          correct: false,
          feedback: "Berbahaya! Inilah cara akun Dito diambil alih. OTP hanya untuk pemilik akun. Siapa pun yang meminta OTP — walau mengaku petugas — patut dicurigai sebagai penipu.",
        },
      ],
    },
    report: {
      threat: "Account Takeover",
      cause: "Kredensial tidak aman dan kode verifikasi dibagikan.",
      recommendations: [
        "Pulihkan akun melalui kanal resmi.",
        "Amankan email yang terhubung dengan akun.",
        "Ganti password dengan password yang unik.",
        "Aktifkan autentikasi dua faktor (2FA).",
      ],
    },
    debrief: [
      "Hebat! Dito berhasil memulihkan akunnya lewat pusat bantuan resmi Instagram.",
      "Pelajarannya: OTP itu rahasia, dan setiap akun butuh password yang berbeda.",
      "Satu kasus lagi. Sasa di Device Security Lab bilang ponselnya mendadak aneh. Ayo bantu dia!",
    ],
  },
  {
    id: "malware",
    number: 3,
    code: "CASE 03",
    title: "Malware Infection",
    threat: "Malware Infection",
    category: "Infeksi perangkat lunak berbahaya",
    difficulty: "Menengah",
    npc: "sasa",
    victim: "Sasa",
    location: "Device Security Lab",
    chronology: [
      "Sasa mengunduh aplikasi dari situs tak dikenal karena menawarkan fitur premium gratis.",
      "Setelah aplikasi terpasang, perangkatnya menjadi lambat.",
      "Muncul aktivitas aplikasi yang tidak dikenali.",
      "Perangkat menampilkan peringatan keamanan.",
    ],
    intro: [
      "Hai! Aku Sasa. Ponselku jadi lemot banget dan baterainya cepat habis...",
      "Beberapa hari lalu aku pasang aplikasi edit foto versi premium gratis dari sebuah situs.",
      "Sekarang ada peringatan keamanan muncul terus. Aku takut datanya kenapa-kenapa!",
      "Ini simulasi ponselku. Bisa kamu periksa?",
    ],
    evidence: [
      {
        id: "downloads",
        title: "Riwayat Unduhan",
        subtitle: "File yang diunduh Sasa minggu ini",
        icon: "⬇️",
        clues: [
          { id: "source", label: "Sumber unduhan", finding: "Aplikasi diunduh dari apk-premium-gratis.xyz, bukan dari toko aplikasi resmi." },
          { id: "bait", label: "Umpan gratis", finding: "\"Versi PRO gratis\" dari aplikasi berbayar adalah umpan klasik penyebar malware." },
          { id: "warning", label: "Peringatan diabaikan", finding: "Browser sudah memperingatkan bahwa file bisa berbahaya, tetapi peringatan itu diabaikan." },
        ],
        note: "Aplikasi dipasang dari sumber tidak resmi meski sudah ada peringatan.",
      },
      {
        id: "apps",
        title: "Daftar Aplikasi",
        subtitle: "Aplikasi yang terpasang di ponsel Sasa",
        icon: "📱",
        clues: [
          { id: "unknown", label: "Aplikasi asing", finding: "Ada aplikasi \"System Service\" tanpa ikon yang tidak pernah dipasang Sasa — muncul sejak FotoKeren PRO dipasang." },
          { id: "perm", label: "Izin berlebihan", finding: "Aplikasi edit foto meminta izin SMS, kontak, dan aksesibilitas. Itu tidak wajar untuk fungsinya." },
          { id: "battery", label: "Baterai & data", finding: "Aplikasi asing memakai baterai dan data paling banyak di latar belakang — tanda aktivitas tersembunyi." },
        ],
        note: "Ada aplikasi asing dengan izin berlebihan yang aktif diam-diam di latar belakang.",
      },
      {
        id: "alert",
        title: "Peringatan Keamanan",
        subtitle: "Notifikasi dari perlindungan perangkat",
        icon: "⚠️",
        clues: [
          { id: "detect", label: "Deteksi perilaku", finding: "Perlindungan perangkat mendeteksi aplikasi mengirim data ke server tak dikenal — perilaku khas spyware/trojan." },
          { id: "origin", label: "Asal peringatan", finding: "Peringatan ini muncul dari pengaturan keamanan bawaan perangkat, bukan pop-up situs. Waspadai pop-up web yang menyuruh mengunduh \"pembersih\"." },
        ],
        note: "Fitur keamanan bawaan perangkat mendeteksi aplikasi dengan perilaku mencurigakan.",
      },
    ],
    decision: {
      question: "Apa tindakan yang paling tepat untuk menangani dugaan infeksi malware?",
      options: [
        {
          id: "A",
          text: "Mengabaikan peringatan dan tetap menggunakan aplikasi tersebut.",
          correct: false,
          feedback: "Kurang tepat. Selama aplikasi berbahaya aktif, ia bisa terus mencuri data, membaca SMS (termasuk OTP), dan memperlambat perangkat. Peringatan keamanan harus ditindaklanjuti.",
        },
        {
          id: "B",
          text: "Mengunduh aplikasi lain dari situs yang sama untuk memperbaiki masalah.",
          correct: false,
          feedback: "Kurang tepat. Situs itu adalah sumber masalahnya. Mengunduh lagi dari sana berisiko menambah malware baru. Gunakan hanya alat keamanan dari sumber resmi.",
        },
        {
          id: "C",
          text: "Menghentikan penggunaan aplikasi mencurigakan, melakukan pemindaian keamanan, menghapus ancaman sesuai prosedur, memperbarui sistem, dan memeriksa keamanan akun.",
          correct: true,
          feedback: "Tepat! Hentikan dan hapus aplikasi mencurigakan, jalankan pemindaian keamanan, perbarui sistem, lalu ganti password akun penting dari perangkat yang aman karena data mungkin sudah bocor.",
        },
      ],
    },
    report: {
      threat: "Malware Infection",
      cause: "Mengunduh dan memasang aplikasi dari sumber tidak tepercaya.",
      recommendations: [
        "Gunakan perlindungan keamanan pada perangkat.",
        "Hapus aplikasi berbahaya dengan aman.",
        "Perbarui sistem operasi dan aplikasi.",
        "Periksa kemungkinan kebocoran akun dan ganti password.",
      ],
    },
    debrief: [
      "Luar biasa! Ponsel Sasa sudah bersih dan akun-akunnya sudah diamankan.",
      "Ingat selalu: unduh aplikasi hanya dari sumber resmi dan jangan abaikan peringatan keamanan.",
      "Kamu sudah menyelesaikan semua kasus di DigiCity. Ada sesuatu yang ingin kami berikan padamu...",
    ],
  },
];

export const CASE_ORDER: CaseId[] = CASES.map((c) => c.id);
export const getCase = (id: CaseId) => CASES.find((c) => c.id === id)!;
export const getCaseByNpc = (npc: NpcId) => CASES.find((c) => c.npc === npc);

export const NPCS: Record<NpcId, { name: string; role: string; desc: string }> = {
  nara: { name: "Nara", role: "Mentor Cyber Center", desc: "Pengelola Cyber Center. Ramah, cerdas, dan selalu siap membimbingmu." },
  ardi: { name: "Ardi", role: "Korban Phishing", desc: "Siswa yang kredensialnya dicuri lewat email palsu." },
  dito: { name: "Dito", role: "Korban Account Takeover", desc: "Pengguna media sosial yang kehilangan akses ke akunnya." },
  sasa: { name: "Sasa", role: "Korban Malware", desc: "Ponselnya bermasalah setelah memasang aplikasi dari sumber tak tepercaya." },
};

export const PROLOGUE: string[] = [
  "Selamat datang di Cyber Center! Mulai hari ini, kamu akan membantu kami menjaga keamanan digital masyarakat DigiCity.",
  "Belakangan ini, beberapa warga mengalami masalah keamanan digital. Ada akun yang diambil alih, informasi login yang dicuri, hingga perangkat yang terinfeksi malware.",
  "Tugasmu adalah membantu mereka memahami apa yang terjadi dan menemukan solusi yang tepat.",
  "Kasus pertama: Ardi di Kantor Pos Digital, sebelah timur jalan utama. Temui dia, ya! Tekan E di dekat warga untuk berbicara.",
];
