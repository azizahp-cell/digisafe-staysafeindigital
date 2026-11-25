import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ClueCtx { found: string[]; hint: boolean; onFind: (id: string) => void }
export const ClueContext = createContext<ClueCtx>({ found: [], hint: false, onFind: () => {} });

export function Clue({ id, children, className, block }: { id: string; children: ReactNode; className?: string; block?: boolean }) {
  const { found, hint, onFind } = useContext(ClueContext);
  const isFound = found.includes(id);
  const n = found.indexOf(id) + 1;
  const Tag = block ? "div" : "span";
  return (
    <Tag
      role="button"
      tabIndex={0}
      aria-label={isFound ? "Petunjuk ditemukan" : "Periksa bagian ini"}
      onClick={(e) => { e.stopPropagation(); if (!isFound) onFind(id); }}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !isFound) onFind(id); }}
      className={cn(
        "relative cursor-zoom-in rounded-sm outline-[0.18rem] outline-offset-2 transition-[outline-color,background-color]",
        block ? "block w-full box-border" : "inline",
        isFound
          ? "cursor-default box-border bg-success-soft outline outline-success"
          : hint
            ? "animate-pulse-ring outline-dashed outline-gold"
            : "outline-transparent hover:bg-gold/25 hover:outline-dashed hover:outline-gold-2",
        className,
      )}
    >
      {children}
      {isFound && (
        <span className="font-pixel absolute -top-3 -right-0 z-10 flex h-6 w-6 items-center justify-center rounded-full border-[0.12rem] border-ink bg-success text-xs text-foreground">
          {n}
        </span>
      )}
    </Tag>
  );
}

const Window = ({ title, children, className }: { title: string; children: ReactNode; className?: string }) => (
  <div className={cn("overflow-hidden rounded-md border-[0.2rem] border-navy bg-card text-navy shadow-[0_0.3rem_0_0_var(--ink)]", className)}>
    <div className="flex items-center gap-2 border-b-[0.15rem] border-navy bg-sky-2 px-3 py-1.5">
      <span className="h-3 w-3 rounded-full bg-danger" /><span className="h-3 w-3 rounded-full bg-gold" /><span className="h-3 w-3 rounded-full bg-success" />
      <span className="font-pixel ml-2 text-sm">{title}</span>
    </div>
    {children}
  </div>
);

const Phone = ({ children, title }: { children: ReactNode; title: string }) => (
  <div className="mx-auto w-[22rem] rounded-[1.8rem] border-[0.35rem] border-ink bg-navy p-2 shadow-[0_0.4rem_0_0_var(--ink)]">
    <div className="overflow-hidden rounded-[1.3rem] bg-card text-navy">
      <div className="flex items-center justify-between bg-navy-2 px-4 py-1.5 text-xs text-foreground"><span>09:41</span><span className="font-pixel">{title}</span><span>▮▮▮ 38%</span></div>
      <div className="p-3">{children}</div>
    </div>
  </div>
);

const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => (
  <table className="w-full text-left text-sm">
    <thead><tr className="bg-sky">{head.map((h) => <th key={h} className="font-pixel px-3 py-2 font-normal">{h}</th>)}</tr></thead>
    <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-border">{r.map((c, j) => <td key={j} className="px-3 py-2.5 align-top">{c}</td>)}</tr>)}</tbody>
  </table>
);

const Ok = ({ children }: { children: ReactNode }) => <span className="rounded bg-success-soft px-2 py-0.5 text-xs font-bold text-success">{children}</span>;
const Bad = ({ children }: { children: ReactNode }) => <span className="rounded bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger">{children}</span>;

// ---------- CASE 01 ----------
function PhishingEmail() {
  return (
    <Window title="DigiMail — Kotak Masuk" className="mx-auto max-w-[40rem]">
      <div className="space-y-2 border-b border-border p-4 text-sm">
        <div><b>Dari:</b> <Clue id="sender">DigiPass Security &lt;security@digipass-verifikasi.com&gt;</Clue></div>
        <div><b>Kepada:</b> ardi.pratama@digimail.id</div>
        <div><b>Subjek:</b> [PENTING] Akun Anda Akan Diblokir dalam 24 Jam!</div>
        <div className="text-muted-foreground">Hari ini, 19:28</div>
      </div>
      <div className="space-y-3 p-5 text-base">
        <p>Yth. Pengguna DigiPass,</p>
        <Clue id="pressure" block className="p-1">
          Kami mendeteksi aktivitas mencurigakan pada akun Anda. <b>Akun Anda akan DIBLOKIR PERMANEN dalam 24 jam</b> jika tidak segera melakukan verifikasi.
        </Clue>
        <Clue id="login" block className="p-1">
          Silakan klik tombol di bawah dan masukkan <b>username serta password</b> Anda untuk memverifikasi akun.
          <div className="mt-3 inline-block rounded-md bg-navy px-5 py-2 font-bold text-foreground">VERIFIKASI SEKARANG</div>
          <div className="mt-1 text-xs text-muted-foreground">http://digipass-verifikasi.com/login</div>
        </Clue>
        <p className="text-sm">Salam, Tim Keamanan DigiPass</p>
      </div>
    </Window>
  );
}

function PhishingUrl() {
  const Fake = (
    <div className="space-y-2 p-5 text-center">
      <Clue id="look" block className="p-2">
        <div className="font-pixel text-2xl text-navy">🔷 DigiPass</div>
        <div className="text-xs text-muted-foreground">Masuk ke akun Anda</div>
      </Clue>
      <div className="mx-auto h-8 w-56 rounded border border-border bg-sky" />
      <div className="mx-auto h-8 w-56 rounded border border-border bg-sky" />
      <div className="mx-auto w-56 rounded bg-navy py-1.5 text-sm font-bold text-foreground">Masuk</div>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-5">
      <div>
        <div className="font-pixel mb-2 text-lg text-success">✓ Situs resmi</div>
        <Window title="DigiPass">
          <div className="flex items-center gap-2 border-b border-border bg-sky px-3 py-2 text-sm"><span>🔒</span><span className="rounded bg-card px-2 py-0.5">https://login.<b>digipass.id</b></span></div>
          <div className="space-y-2 p-5 text-center">
            <div className="font-pixel text-2xl text-navy">🔷 DigiPass</div>
            <div className="text-xs text-muted-foreground">Masuk ke akun Anda</div>
            <div className="mx-auto h-8 w-56 rounded border border-border bg-sky" />
            <div className="mx-auto h-8 w-56 rounded border border-border bg-sky" />
            <div className="mx-auto w-56 rounded bg-navy py-1.5 text-sm font-bold text-foreground">Masuk</div>
          </div>
        </Window>
      </div>
      <div>
        <div className="font-pixel mb-2 text-lg text-danger">? Situs dari email</div>
        <Window title="DigiPass">
          <div className="flex items-center gap-2 border-b border-border bg-sky px-3 py-2 text-sm">
            <Clue id="https"><span className="px-1">⚠ Tidak aman</span></Clue>
            <Clue id="domain"><span className="rounded bg-card px-2 py-0.5">http://<b>digipass-verifikasi.com</b>/login</span></Clue>
          </div>
          {Fake}
        </Window>
      </div>
    </div>
  );
}

function PhishingLog() {
  return (
    <Window title="DigiPass — Aktivitas Login" className="mx-auto max-w-[46rem]">
      <div className="border-b border-border bg-sky/50 px-4 py-2 text-sm">Catatan Ardi: <i>"Aku mengisi halaman verifikasi pukul 19:31."</i></div>
      <Table
        head={["Waktu", "Perangkat", "Lokasi", "Status"]}
        rows={[
          ["Hari ini 07:12", "Android · Ponsel Ardi", "DigiCity", <Ok key="a">Dikenali</Ok>],
          ["Hari ini 12:45", "Android · Ponsel Ardi", "DigiCity", <Ok key="b">Dikenali</Ok>],
          [
            <Clue key="t" id="timing">Hari ini 19:40</Clue>,
            <Clue key="u" id="unknown">Windows PC · Browser</Clue>,
            "Kota lain (IP 203.0.113.45)",
            <Bad key="c">Tidak dikenali</Bad>,
          ],
          ["Hari ini 19:43", "Windows PC · Browser", "Kota lain", <Bad key="d">Upaya ganti password</Bad>],
        ]}
      />
    </Window>
  );
}

// ---------- CASE 02 ----------
function TakeoverLog() {
  return (
    <Window title="DigiGram — Aktivitas Login" className="mx-auto max-w-[46rem]">
      <Table
        head={["Waktu", "Perangkat", "Lokasi", "Status"]}
        rows={[
          ["Kemarin 20:05", "Laptop · Dito", "DigiCity", <Ok key="a">Dikenali</Ok>],
          [<Clue key="n" id="night">Hari ini 02:14</Clue>, "Ponsel tidak dikenal", "Kota lain (IP 198.51.100.23)", <Bad key="b">Tidak dikenali</Bad>],
          [<Clue key="m" id="multi" block>Hari ini 02:20</Clue>, "Browser desktop", "Luar negeri (IP 203.0.113.77)", <Bad key="c">Tidak dikenali</Bad>],
          ["Hari ini 07:30", "Laptop · Dito", "DigiCity", <Bad key="d">Gagal — password salah</Bad>],
        ]}
      />
    </Window>
  );
}

function TakeoverSettings() {
  return (
    <Window title="DigiGram — Pengaturan Akun" className="mx-auto max-w-[40rem]">
      <div className="divide-y divide-border">
        <div className="flex justify-between px-5 py-3"><span className="text-muted-foreground">Nama pengguna</span><b>@dito.foto</b></div>
        <Clue id="recovery" block className="px-5 py-3">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Email pemulihan</span>
            <span className="text-right"><s className="text-muted-foreground">dito.pr@digimail.id</s><br /><b className="text-danger">recovery.acc9921@mailcepat.net</b></span>
          </div>
          <div className="mt-1 text-xs text-danger">Diubah hari ini 02:22 dari perangkat tidak dikenal</div>
        </Clue>
        <Clue id="password" block className="px-5 py-3">
          <div className="flex justify-between"><span className="text-muted-foreground">Password</span><b>••••••••••</b></div>
          <div className="mt-1 text-xs text-danger">Diubah hari ini 02:25 dari perangkat tidak dikenal</div>
        </Clue>
        <div className="flex justify-between px-5 py-3"><span className="text-muted-foreground">Autentikasi dua faktor</span><Bad>Tidak aktif</Bad></div>
      </div>
    </Window>
  );
}

function TakeoverSecurity() {
  return (
    <div className="grid grid-cols-[1fr_1.1fr] gap-5">
      <Phone title="Pesan">
        <Clue id="fake" block className="mb-2 p-1">
          <div className="flex items-center gap-2 border-b border-border pb-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky">🛠</span><div><b>DigiGram Support</b><div className="text-xs text-muted-foreground">akun pribadi · bukan terverifikasi</div></div></div>
        </Clue>
        <div className="space-y-2 text-sm">
          <div className="max-w-[85%] rounded-lg bg-sky px-3 py-2">Halo! Akun kamu akan dinonaktifkan karena melanggar aturan. Kirimkan kode 6 digit yang baru masuk ke HP kamu ya, supaya kami bisa memverifikasi.</div>
          <div className="rounded-lg bg-muted px-3 py-2 text-xs">SMS DigiGram: Kode verifikasi kamu 482913. JANGAN berikan kode ini kepada siapa pun.</div>
          <Clue id="otp" block className="ml-auto max-w-[60%] rounded-lg bg-navy px-3 py-2 text-foreground">482913 👍</Clue>
        </div>
      </Phone>
      <Window title="Laporan Keamanan Akun">
        <div className="space-y-3 p-4 text-sm">
          <div className="rounded-md bg-sky p-3"><b>02:10</b> — Kode OTP dikirim ke nomor Dito.</div>
          <div className="rounded-md bg-sky p-3"><b>02:13</b> — Kode OTP dipakai dari perangkat tidak dikenal.</div>
          <Clue id="reuse" block className="rounded-md bg-danger-soft p-3">
            <b>Pemeriksaan password:</b> password akun ini sama dengan yang dipakai di <b>GameZone</b> dan <b>ForumSekolah</b>.
            <div className="mt-1 text-xs">GameZone mengalami kebocoran data bulan lalu.</div>
          </Clue>
        </div>
      </Window>
    </div>
  );
}

// ---------- CASE 03 ----------
function MalwareDownloads() {
  return (
    <Window title="Browser — Unduhan" className="mx-auto max-w-[44rem]">
      <div className="divide-y divide-border">
        <div className="flex items-center gap-4 px-5 py-4">
          <span className="text-3xl">📦</span>
          <div className="flex-1">
            <Clue id="bait"><b>FotoKeren_PRO_Gratis_FullUnlock.apk</b></Clue>
            <div className="mt-1 text-sm text-muted-foreground">Sumber: <Clue id="source">apk-premium-gratis.xyz</Clue> · 3 hari lalu · 24 MB</div>
            <Clue id="warning" block className="mt-2 rounded-md bg-danger-soft px-3 py-1.5 text-sm text-danger">⚠ File jenis ini dapat membahayakan perangkat. <b>[Tetap unduh]</b> dipilih</Clue>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-4">
          <span className="text-3xl">📄</span>
          <div className="flex-1"><b>Tugas_Biologi_Kelas9.pdf</b><div className="text-sm text-muted-foreground">Sumber: sekolah.digicity.id · 5 hari lalu</div></div>
          <Ok>Aman</Ok>
        </div>
      </div>
    </Window>
  );
}

function MalwareApps() {
  const App = ({ icon, name, info }: { icon: string; name: string; info: string }) => (
    <div className="flex items-center gap-3 py-2"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky text-xl">{icon}</span><div><b>{name}</b><div className="text-xs text-muted-foreground">{info}</div></div></div>
  );
  return (
    <div className="grid grid-cols-2 gap-5">
      <Phone title="Aplikasi">
        <div className="divide-y divide-border text-sm">
          <App icon="💬" name="DigiChat" info="Toko aplikasi resmi" />
          <App icon="📷" name="Kamera" info="Bawaan sistem" />
          <Clue id="perm" block className="p-1">
            <App icon="🎨" name="FotoKeren PRO" info="Sumber tidak dikenal" />
            <div className="mb-1 flex flex-wrap gap-1 text-xs"><Bad>SMS</Bad><Bad>Kontak</Bad><Bad>Aksesibilitas</Bad><Ok>Galeri</Ok></div>
          </Clue>
          <Clue id="unknown" block className="p-1"><App icon="⬜" name="System Service" info="Tanpa ikon · dipasang 3 hari lalu" /></Clue>
        </div>
      </Phone>
      <Window title="Pemakaian Baterai & Data">
        <div className="space-y-3 p-4 text-sm">
          <Clue id="battery" block className="p-1">
            <div className="flex justify-between"><b>System Service</b><span>46% · 1,2 GB</span></div>
            <div className="mt-1 h-3 rounded bg-sky"><div className="h-full w-[46%] rounded bg-danger" /></div>
            <div className="mt-1 text-xs text-danger">Aktif di latar belakang 23 jam</div>
          </Clue>
          {[["DigiChat", 18, "210 MB"], ["Kamera", 9, "—"], ["FotoKeren PRO", 7, "90 MB"]].map(([n, p, d]) => (
            <div key={n as string}>
              <div className="flex justify-between"><b>{n}</b><span>{p}% · {d}</span></div>
              <div className="mt-1 h-3 rounded bg-sky"><div className="h-full rounded bg-cyan" style={{ width: `${p}%` }} /></div>
            </div>
          ))}
        </div>
      </Window>
    </div>
  );
}

function MalwareAlert() {
  return (
    <Phone title="Keamanan">
      <Clue id="origin" block className="mb-3 p-1">
        <div className="text-xs text-muted-foreground">Pengaturan › Keamanan › Perlindungan Perangkat</div>
      </Clue>
      <div className="rounded-xl border-[0.2rem] border-danger bg-danger-soft p-4 text-center">
        <div className="text-4xl">⚠️</div>
        <div className="font-pixel mt-1 text-xl text-danger">Aplikasi Berbahaya Terdeteksi</div>
        <Clue id="detect" block className="mt-2 p-1 text-sm">
          Aplikasi <b>"System Service"</b> berperilaku mencurigakan: mengirim data pribadi ke server tidak dikenal dan membaca SMS.
        </Clue>
        <div className="mt-3 flex justify-center gap-2 text-sm">
          <span className="rounded-md bg-danger px-3 py-1.5 font-bold text-foreground">Hapus aplikasi</span>
          <span className="rounded-md bg-muted px-3 py-1.5">Abaikan</span>
        </div>
      </div>
      <div className="mt-3 text-center text-xs text-muted-foreground">Simulasi edukasi · tidak ada file berbahaya sungguhan</div>
    </Phone>
  );
}

export const EVIDENCE_VIEWS: Record<string, () => React.JSX.Element> = {
  "phishing:email": PhishingEmail,
  "phishing:url": PhishingUrl,
  "phishing:loginlog": PhishingLog,
  "takeover:loginlog": TakeoverLog,
  "takeover:settings": TakeoverSettings,
  "takeover:security": TakeoverSecurity,
  "malware:downloads": MalwareDownloads,
  "malware:apps": MalwareApps,
  "malware:alert": MalwareAlert,
};
