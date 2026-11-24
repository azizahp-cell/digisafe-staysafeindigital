import type { NpcId } from "../data/cases";

export const TILE = 32;
export const MAP_W = 48 * TILE; // 1536
export const MAP_H = 30 * TILE; // 960
export const VIEW_W = 960;
export const VIEW_H = 540;

export interface Rect { x: number; y: number; w: number; h: number }

export const ROAD_H: Rect = { x: 0, y: 448, w: MAP_W, h: 96 };
export const ROAD_V: Rect = { x: 704, y: 0, w: 96, h: MAP_H };
export const SIDEWALKS: Rect[] = [
  { x: 0, y: 416, w: MAP_W, h: 32 },
  { x: 0, y: 544, w: MAP_W, h: 32 },
  { x: 672, y: 0, w: 32, h: MAP_H },
  { x: 800, y: 0, w: 32, h: MAP_H },
];
export const PLAZAS: Rect[] = [
  { x: 168, y: 360, w: 344, h: 56 },
  { x: 990, y: 360, w: 262, h: 56 },
  { x: 40, y: 870, w: MAP_W - 80, h: 58 },
  { x: 420, y: 576, w: 40, h: 294 },
  { x: 1270, y: 576, w: 40, h: 294 },
  { x: 460, y: 716, w: 212, h: 28 },
];
export const FLOWER_BEDS: Rect[] = [
  { x: 524, y: 136, w: 128, h: 36 },
  { x: 1296, y: 292, w: 150, h: 44 },
  { x: 476, y: 604, w: 70, h: 30 },
  { x: 590, y: 604, w: 70, h: 30 },
  { x: 1376, y: 806, w: 110, h: 40 },
  { x: 852, y: 610, w: 120, h: 32 },
];

export type BuildingKey = "cyber_center" | "phishing_house" | "account_house" | "device_lab";
export interface Building { key: BuildingKey; x: number; y: number; w: number; h: number }
export const BUILDINGS: Building[] = [
  { key: "cyber_center", x: 190, y: 118, w: 300, h: 250 },
  { key: "phishing_house", x: 1010, y: 175, w: 220, h: 193 },
  { key: "account_house", x: 150, y: 652, w: 220, h: 218 },
  { key: "device_lab", x: 1010, y: 660, w: 220, h: 210 },
];

export const FOUNTAIN = { x: 494, y: 662, w: 120, h: 118 };

// Trees: centre-x and base (ground contact) y.
export const TREES: { x: number; y: number }[] = (() => {
  const t: { x: number; y: number }[] = [];
  for (let x = 30; x < MAP_W; x += 64) t.push({ x, y: 66 });
  for (let x = 62; x < MAP_W; x += 64) if (x < 660 || x > 840) t.push({ x, y: 102 });
  for (let y = 170; y < MAP_H - 60; y += 72) {
    if (y > 380 && y < 610) continue;
    t.push({ x: 22, y });
    t.push({ x: MAP_W - 22, y });
  }
  t.push(
    { x: 566, y: 236 }, { x: 640, y: 300 }, { x: 560, y: 340 },
    { x: 1310, y: 230 }, { x: 1440, y: 190 }, { x: 1476, y: 360 },
    { x: 870, y: 250 }, { x: 952, y: 340 }, { x: 870, y: 380 },
    { x: 484, y: 660 }, { x: 650, y: 660 }, { x: 488, y: 852 }, { x: 650, y: 852 },
    { x: 1340, y: 660 }, { x: 1470, y: 700 }, { x: 1350, y: 852 },
    { x: 880, y: 720 }, { x: 960, y: 850 }, { x: 880, y: 852 },
    { x: 120, y: 230 }, { x: 96, y: 330 },
  );
  return t;
})();

export const LAMPS: { x: number; y: number }[] = [
  { x: 110, y: 438 }, { x: 560, y: 438 }, { x: 900, y: 438 }, { x: 1300, y: 438 }, { x: 1470, y: 438 },
  { x: 110, y: 574 }, { x: 380, y: 574 }, { x: 900, y: 574 }, { x: 1180, y: 574 }, { x: 1470, y: 574 },
  { x: 688, y: 220 }, { x: 816, y: 300 }, { x: 688, y: 780 }, { x: 816, y: 720 },
];

export const BENCHES: Rect[] = [
  { x: 520, y: 382, w: 44, h: 20 },
  { x: 1350, y: 380, w: 44, h: 20 },
  { x: 505, y: 800, w: 44, h: 20 },
  { x: 600, y: 800, w: 44, h: 20 },
  { x: 1400, y: 620, w: 44, h: 20 },
];

export const BUSHES: { x: number; y: number }[] = [
  { x: 400, y: 840 }, { x: 384, y: 690 }, { x: 990, y: 860 }, { x: 1250, y: 700 },
  { x: 150, y: 400 }, { x: 1262, y: 400 }, { x: 980, y: 700 },
];

export interface Sign { id: string; x: number; y: number; label: string; text: string }
export const SIGNS: Sign[] = [
  { id: "sign:cyber", x: 176, y: 410, label: "CYBER CENTER", text: "CYBER CENTER — Pusat bantuan keamanan digital warga DigiCity. Masuk untuk membuka Cyberpedia." },
  { id: "sign:phishing", x: 980, y: 410, label: "KANTOR POS DIGITAL", text: "PHISHING INVESTIGATION AREA — Kantor Pos Digital. \"Cek dulu pengirimnya sebelum membuka tautan!\"" },
  { id: "sign:takeover", x: 104, y: 906, label: "KEAMANAN AKUN", text: "ACCOUNT SECURITY AREA — Gedung Keamanan Akun. \"OTP itu rahasia, jangan dibagikan!\"" },
  { id: "sign:malware", x: 1252, y: 906, label: "DEVICE LAB", text: "DEVICE SECURITY LAB — \"Unduh aplikasi hanya dari sumber resmi.\"" },
  { id: "sign:welcome", x: 846, y: 412, label: "DIGICITY", text: "Selamat datang di DigiCity! Think Before You Click. Stay Safe in Digital World." },
];

export const KIOSK = { x: 618, y: 412 };
export const TOWER = { x: 1440, y: 790 };

export const NPC_SPOTS: Record<NpcId, { x: number; y: number }> = {
  nara: { x: 430, y: 400 },
  ardi: { x: 1186, y: 400 },
  dito: { x: 330, y: 906 },
  sasa: { x: 1146, y: 906 },
};

export const PLAYER_START = { x: 352, y: 444 };

export const DOORS = [{ id: "door:cyber", x: 340, y: 372 }];

export const ZONES: (Rect & { name: string })[] = [
  { name: "Cyber Center", x: 150, y: 100, w: 380, h: 330 },
  { name: "Phishing Investigation Area", x: 960, y: 100, w: 340, h: 330 },
  { name: "Account Security Area", x: 60, y: 600, w: 360, h: 340 },
  { name: "Device Security Lab", x: 960, y: 600, w: 340, h: 340 },
  { name: "Taman Kota", x: 462, y: 590, w: 210, h: 280 },
  { name: "Persimpangan Utama", x: 672, y: 416, w: 160, h: 160 },
];

/** Static collision boxes (feet-level). */
export function buildSolids(): Rect[] {
  const s: Rect[] = [];
  for (const b of BUILDINGS) s.push({ x: b.x + 8, y: b.y - 40, w: b.w - 16, h: b.h + 40 - 10 });
  for (const t of TREES) s.push({ x: t.x - 10, y: t.y - 12, w: 20, h: 12 });
  s.push({ x: FOUNTAIN.x + 8, y: FOUNTAIN.y + 34, w: FOUNTAIN.w - 16, h: FOUNTAIN.h - 40 });
  for (const l of LAMPS) s.push({ x: l.x - 4, y: l.y - 6, w: 8, h: 6 });
  for (const b of BENCHES) s.push({ x: b.x, y: b.y + 4, w: b.w, h: b.h - 4 });
  for (const b of BUSHES) s.push({ x: b.x - 14, y: b.y - 10, w: 28, h: 10 });
  for (const g of SIGNS) s.push({ x: g.x - 5, y: g.y - 6, w: 10, h: 6 });
  s.push({ x: KIOSK.x - 14, y: KIOSK.y - 10, w: 28, h: 10 });
  s.push({ x: TOWER.x - 12, y: TOWER.y - 10, w: 24, h: 10 });
  s.push({ x: 0, y: 928, w: MAP_W, h: 40 });
  s.push({ x: 0, y: 0, w: MAP_W, h: 108 });
  return s;
}
