import imgPhishing from "@/assets/learn-phishing.jpg";
import imgAccount from "@/assets/learn-account.jpg";
import imgMalware from "@/assets/learn-malware.jpg";

export type MaterialId = "phishing" | "takeover" | "malware";

export type Section =
  | { kind: "text"; title: string; icon: string; text: string }
  | { kind: "steps"; title: string; icon: string; items: string[] }
  | { kind: "list"; title: string; icon: string; items: string[] }
  | { kind: "terms"; title: string; icon: string; items: { term: string; desc: string }[] }
  | { kind: "story"; title: string; icon: string; text: string; lesson: string };

export interface Material {
  id: MaterialId;
  code: string;
  short: string;
  title: string;
  image: string;
  goal: string;
  sections: Section[];
}

export const MATERIALS: Material[] = [
  {
    id: "phishing",
    code: "MATERI 01",
    short: "Phishing Attack",
    title: "Mengenal Phishing dan Pencurian Kredensial",
    image: imgPhishing,
    goal: "Kamu mampu mengenali pesan dan situs phishing, serta tahu cara melindungi informasi login.",
    sections: [
      {
        kind: "text",
        title: "Pengertian",
        icon: "📖",
        text: "Phishing merupakan teknik penipuan yang menggunakan pesan, email, atau situs web untuk mengelabui seseorang agar memberikan informasi sensitif seperti username, password, dan informasi akun lainnya.",
      },
      {
        kind: "steps",
        title: "Cara Kerja Ancaman",
        icon: "⚙️",
        items: [
          "Pelaku mengirim pesan yang terlihat meyakinkan.",
          "Korban diarahkan ke situs atau halaman login tertentu.",
          "Korban memasukkan informasi akun.",
          "Informasi tersebut dapat digunakan pelaku untuk mengakses akun korban.",
        ],
      },
      {
        kind: "story",
        title: "Contoh Kejadian",
        icon: "📰",
        text: "Rani menerima email: \"Akun kamu akan diblokir dalam 24 jam! Klik di sini untuk verifikasi.\" Halaman yang terbuka mirip sekali dengan aslinya, jadi Rani mengetik password-nya. Besoknya, akun Rani dipakai untuk mengirim pesan penipuan ke teman-temannya.",
        lesson: "Tampilan yang mirip belum tentu asli. Yang menentukan adalah alamat situsnya.",
      },
      {
        kind: "list",
        title: "Ciri-ciri Phishing",
        icon: "🔍",
        items: [
          "Alamat pengirim mencurigakan.",
          "Domain situs tidak sesuai dengan layanan resmi.",
          "Meminta informasi login secara tidak wajar.",
          "Menggunakan tekanan atau ancaman agar korban segera bertindak.",
        ],
      },
      {
        kind: "list",
        title: "Cara Pencegahan",
        icon: "🛡️",
        items: [
          "Periksa alamat situs sebelum login.",
          "Jangan membuka tautan yang tidak jelas sumbernya.",
          "Jangan memberikan password kepada orang lain.",
          "Aktifkan autentikasi dua faktor (2FA).",
          "Gunakan aplikasi atau situs resmi.",
        ],
      },
    ],
  },
  {
    id: "takeover",
    code: "MATERI 02",
    short: "Account Takeover",
    title: "Perlindungan Akun dan Pengambilalihan Akun",
    image: imgAccount,
    goal: "Kamu memahami penyebab akun diambil alih dan mampu menerapkan password kuat, OTP, dan 2FA dengan benar.",
    sections: [
      {
        kind: "text",
        title: "Pengertian",
        icon: "📖",
        text: "Account takeover adalah kondisi ketika pihak yang tidak berwenang berhasil memperoleh akses ke akun milik orang lain.",
      },
      {
        kind: "list",
        title: "Cara Terjadinya (Penyebab)",
        icon: "⚙️",
        items: [
          "Password lemah.",
          "Menggunakan password yang sama pada banyak layanan.",
          "Kredensial dicuri melalui phishing.",
          "Kode OTP dibagikan kepada orang lain.",
          "Perangkat atau sesi login tidak diamankan.",
        ],
      },
      {
        kind: "story",
        title: "Contoh Kejadian",
        icon: "📰",
        text: "Bima memakai password yang sama untuk game online dan media sosial. Ketika data situs game itu bocor, pelaku mencoba password yang sama di media sosial Bima — dan berhasil masuk. Pelaku lalu mengganti email pemulihan sehingga Bima terkunci dari akunnya sendiri.",
        lesson: "Satu password bocor bisa membuka banyak akun jika password itu dipakai berulang.",
      },
      {
        kind: "terms",
        title: "Materi Penting",
        icon: "🔑",
        items: [
          { term: "Password kuat & unik", desc: "Panjang (minimal 12 karakter, misalnya gabungan beberapa kata) dan berbeda di setiap layanan." },
          { term: "One-Time Password (OTP)", desc: "Kode sekali pakai yang hanya untukmu. Petugas resmi tidak akan pernah memintanya." },
          { term: "Two-Factor Authentication (2FA)", desc: "Lapisan kedua selain password, misalnya kode dari aplikasi autentikator." },
          { term: "Password manager", desc: "Aplikasi untuk menyimpan dan membuat password unik dengan aman." },
          { term: "Pemulihan resmi", desc: "Pulihkan akun hanya melalui fitur atau pusat bantuan resmi layanan tersebut." },
        ],
      },
      {
        kind: "list",
        title: "Ciri Akun Diambil Alih",
        icon: "🔍",
        items: [
          "Ada login dari perangkat atau lokasi yang tidak kamu kenal.",
          "Email atau nomor pemulihan berubah tanpa sepengetahuanmu.",
          "Password tiba-tiba tidak bisa dipakai.",
          "Muncul pesan atau unggahan yang tidak pernah kamu buat.",
        ],
      },
      {
        kind: "list",
        title: "Cara Pencegahan",
        icon: "🛡️",
        items: [
          "Gunakan password panjang dan unik.",
          "Jangan pernah membagikan OTP.",
          "Aktifkan 2FA.",
          "Periksa aktivitas login secara berkala.",
          "Keluar dari perangkat yang tidak dikenal.",
          "Gunakan prosedur pemulihan resmi.",
        ],
      },
    ],
  },
  {
    id: "malware",
    code: "MATERI 03",
    short: "Malware Infection",
    title: "Mengenal Malware dan Keamanan Perangkat",
    image: imgMalware,
    goal: "Kamu mampu mengenali tanda perangkat terinfeksi malware dan tahu langkah aman untuk menanganinya.",
    sections: [
      {
        kind: "text",
        title: "Pengertian",
        icon: "📖",
        text: "Malware merupakan perangkat lunak berbahaya yang dirancang untuk merusak sistem, mencuri informasi, memata-matai aktivitas, atau memperoleh akses tanpa izin.",
      },
      {
        kind: "terms",
        title: "Jenis Malware",
        icon: "🐛",
        items: [
          { term: "Virus", desc: "Dapat menginfeksi file atau program." },
          { term: "Trojan", desc: "Menyamar sebagai program yang terlihat aman." },
          { term: "Spyware", desc: "Memantau aktivitas dan mengumpulkan informasi pengguna." },
          { term: "Ransomware", desc: "Mengunci atau mengenkripsi data dan meminta tebusan." },
        ],
      },
      {
        kind: "list",
        title: "Cara Penyebaran",
        icon: "⚙️",
        items: [
          "Mengunduh aplikasi dari sumber tidak resmi.",
          "Membuka lampiran berbahaya.",
          "Menggunakan perangkat lunak yang tidak aman.",
          "Mengunjungi situs yang menyebarkan file berbahaya.",
        ],
      },
      {
        kind: "story",
        title: "Contoh Kejadian",
        icon: "📰",
        text: "Tono memasang \"aplikasi edit foto versi premium gratis\" dari sebuah situs. Aplikasi itu meminta izin membaca SMS dan kontak. Tak lama, baterai cepat habis, kuota internet boros, dan iklan aneh terus bermunculan.",
        lesson: "Aplikasi berbayar yang ditawarkan gratis di situs tak resmi sering menjadi umpan malware.",
      },
      {
        kind: "list",
        title: "Ciri Perangkat Terinfeksi",
        icon: "🔍",
        items: [
          "Perangkat tiba-tiba lambat atau cepat panas.",
          "Baterai dan kuota internet boros tanpa sebab jelas.",
          "Muncul aplikasi asing yang tidak kamu pasang.",
          "Iklan atau pop-up muncul terus-menerus.",
          "Fitur keamanan perangkat memberi peringatan.",
        ],
      },
      {
        kind: "list",
        title: "Cara Pencegahan",
        icon: "🛡️",
        items: [
          "Unduh aplikasi dari sumber resmi.",
          "Gunakan antivirus atau perlindungan keamanan.",
          "Perbarui sistem operasi dan aplikasi.",
          "Hindari membuka file yang tidak dikenal.",
          "Lakukan pencadangan data secara berkala.",
        ],
      },
    ],
  },
];

export const getMaterial = (id: MaterialId) => MATERIALS.find((m) => m.id === id)!;
