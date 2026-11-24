import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/game/Game";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DIGISAFE — Game Edukasi Keamanan Siber" },
      { name: "description", content: "Jelajahi DigiCity, periksa bukti digital, dan selesaikan kasus phishing, account takeover, dan malware. Think Before You Click." },
      { property: "og:title", content: "DIGISAFE — Game Edukasi Keamanan Siber" },
      { property: "og:description", content: "Game Edukasi RPG pixel art untuk siswa SMP Kelas IX: belajar mengenali phishing, melindungi akun, dan mencegah malware." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <Game />;
}
