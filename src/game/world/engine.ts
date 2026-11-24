import type { NpcId } from "../data/cases";
import { spriteSrc, type CharId } from "../sprites";
import cyberImg from "@/assets/world/cyber_center.png";
import phishImg from "@/assets/world/phishing_house.png";
import accountImg from "@/assets/world/account_house.png";
import deviceImg from "@/assets/world/device_lab.png";
import treeImg from "@/assets/world/tree.png";
import fountainImg from "@/assets/world/fountain.png";
import {
  BENCHES, BUILDINGS, BUSHES, DOORS, FLOWER_BEDS, FOUNTAIN, KIOSK, LAMPS, MAP_H, MAP_W, NPC_SPOTS,
  PLAZAS, ROAD_H, ROAD_V, SIDEWALKS, SIGNS, TOWER, TREES, VIEW_H, VIEW_W, ZONES, buildSolids, type Rect,
} from "./map";

export type Dir = "down" | "up" | "left" | "right";
export interface Actor { id: CharId; x: number; y: number; dir: Dir; moving: boolean; phase: number }
export interface Interactable { id: string; x: number; y: number; label: string }
export type Marker = "mission" | "done";

// Canvas art palette (pixel-art scene colours; UI colours live in styles.css).
const C = {
  grass: "#7cc456", grassDark: "#5fae45", grassLight: "#9bd96a", tuft: "#4e9a3a",
  road: "#5b6479", roadDark: "#4f576b", roadLine: "#f6d55c", curb: "#c9c2b6", crosswalk: "#eef2f6",
  walk: "#e2d7c4", walkLine: "#cbbda6", plaza: "#ece2d0", plazaLine: "#d2c3a9",
  soil: "#8a5a3c", soilDark: "#6e4630", hedge: "#3f8a37", hedgeLight: "#59a84a",
  ink: "#1b2240", navy: "#1f2f5c", cyan: "#4fd6f0", wood: "#9b6a3e", woodDark: "#6e4728", gold: "#ffd34d",
};

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const inRect = (x: number, y: number, r: Rect) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function buildGround(): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = MAP_W; cv.height = MAP_H;
  const g = cv.getContext("2d")!;
  const r = rng(7);
  g.fillStyle = C.grass; g.fillRect(0, 0, MAP_W, MAP_H);
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = r() > 0.5 ? C.grassDark : C.grassLight;
    g.fillRect(Math.floor(r() * MAP_W / 2) * 2, Math.floor(r() * MAP_H / 2) * 2, 2, 2);
  }
  for (let i = 0; i < 900; i++) {
    const x = Math.floor(r() * MAP_W), y = Math.floor(r() * MAP_H);
    g.fillStyle = C.tuft; g.fillRect(x, y, 2, 4); g.fillRect(x - 2, y + 2, 2, 2); g.fillRect(x + 2, y + 1, 2, 3);
  }
  // sidewalks
  for (const s of SIDEWALKS) {
    g.fillStyle = C.walk; g.fillRect(s.x, s.y, s.w, s.h);
    g.fillStyle = C.walkLine;
    for (let x = s.x; x < s.x + s.w; x += 16) g.fillRect(x, s.y, 1, s.h);
    for (let y = s.y; y < s.y + s.h; y += 16) g.fillRect(s.x, y, s.w, 1);
  }
  // plazas: brick pattern
  for (const p of PLAZAS) {
    g.fillStyle = C.plaza; g.fillRect(p.x, p.y, p.w, p.h);
    g.fillStyle = C.plazaLine;
    for (let y = p.y, row = 0; y < p.y + p.h; y += 12, row++) {
      g.fillRect(p.x, y, p.w, 1);
      for (let x = p.x + (row % 2 ? 12 : 0); x < p.x + p.w; x += 24) g.fillRect(x, y, 1, 12);
    }
  }
  // fountain stone ring
  g.fillStyle = C.plaza;
  g.beginPath(); g.ellipse(FOUNTAIN.x + 60, FOUNTAIN.y + 74, 92, 72, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = C.plazaLine; g.lineWidth = 2;
  for (const rr of [92, 70]) { g.beginPath(); g.ellipse(FOUNTAIN.x + 60, FOUNTAIN.y + 74, rr, rr * 0.78, 0, 0, Math.PI * 2); g.stroke(); }
  // roads
  for (const rd of [ROAD_H, ROAD_V]) {
    g.fillStyle = C.road; g.fillRect(rd.x, rd.y, rd.w, rd.h);
    for (let i = 0; i < (rd.w * rd.h) / 120; i++) {
      g.fillStyle = C.roadDark;
      g.fillRect(rd.x + Math.floor(r() * rd.w), rd.y + Math.floor(r() * rd.h), 2, 2);
    }
  }
  g.fillStyle = C.curb;
  g.fillRect(0, ROAD_H.y, MAP_W, 3); g.fillRect(0, ROAD_H.y + ROAD_H.h - 3, MAP_W, 3);
  g.fillRect(ROAD_V.x, 0, 3, MAP_H); g.fillRect(ROAD_V.x + ROAD_V.w - 3, 0, 3, MAP_H);
  // intersection
  g.fillStyle = C.road; g.fillRect(ROAD_V.x, ROAD_H.y, ROAD_V.w, ROAD_H.h);
  g.fillStyle = C.roadLine;
  for (let x = 0; x < MAP_W; x += 40) if (x + 22 < ROAD_V.x - 40 || x > ROAD_V.x + ROAD_V.w + 40) g.fillRect(x, ROAD_H.y + 47, 22, 3);
  for (let y = 0; y < MAP_H; y += 40) if (y + 22 < ROAD_H.y - 40 || y > ROAD_H.y + ROAD_H.h + 40) g.fillRect(ROAD_V.x + 47, y, 3, 22);
  g.fillStyle = C.crosswalk;
  for (let i = 0; i < 8; i++) {
    const o = 6 + i * 11;
    g.fillRect(ROAD_V.x - 34, ROAD_H.y + o, 26, 6);
    g.fillRect(ROAD_V.x + ROAD_V.w + 8, ROAD_H.y + o, 26, 6);
    g.fillRect(ROAD_V.x + o, ROAD_H.y - 34, 6, 26);
    g.fillRect(ROAD_V.x + o, ROAD_H.y + ROAD_H.h + 8, 6, 26);
  }
  // flower beds soil
  for (const f of FLOWER_BEDS) {
    g.fillStyle = C.soilDark; g.fillRect(f.x - 2, f.y - 2, f.w + 4, f.h + 4);
    g.fillStyle = C.soil; g.fillRect(f.x, f.y, f.w, f.h);
  }
  // bottom hedge
  g.fillStyle = C.hedge; g.fillRect(0, 928, MAP_W, 32);
  for (let x = 0; x < MAP_W; x += 16) {
    g.fillStyle = C.hedgeLight; g.beginPath(); g.arc(x + 8, 932, 9, 0, Math.PI * 2); g.fill();
    g.fillStyle = C.hedge; g.fillRect(x + 3, 936, 3, 3);
  }
  g.fillStyle = C.ink; g.fillRect(0, 927, MAP_W, 1);
  return cv;
}

interface Flower { x: number; y: number; color: string; ph: number }
interface Butterfly { x: number; y: number; cx: number; cy: number; ph: number; color: string; sp: number }
interface Cloud { x: number; y: number; rx: number; ry: number; sp: number }
interface Drop { x: number; y: number; vx: number; vy: number; life: number }

const pick = (a: string[], k: number) => a[Math.floor(k * a.length)] ?? a[0]!;
const FLOWER_COLORS: string[] = ["#ff7aa8", "#ffd34d", "#ffffff", "#ff8a5c", "#b58cff", "#5fd3ff"];

export class WorldEngine {
  private ctx: CanvasRenderingContext2D;
  private images = new Map<string, HTMLImageElement>();
  private ground: HTMLCanvasElement;
  private solids: Rect[] = buildSolids();
  private flowers: Flower[] = [];
  private butterflies: Butterfly[] = [];
  private clouds: Cloud[] = [];
  private drops: Drop[] = [];
  private t = 0;
  private stepTimer = 0;
  private zone = "";
  cam = { x: 0, y: 0 };
  keys = new Set<string>();
  frozen = false;
  player: Actor;
  npcs: Actor[];
  markers: Partial<Record<NpcId, Marker>> = {};
  near: Interactable | null = null;
  onNear?: (it: Interactable | null) => void;
  onZone?: (name: string) => void;
  onStep?: () => void;

  constructor(canvas: HTMLCanvasElement, start: { x: number; y: number; dir: Dir }) {
    this.ctx = canvas.getContext("2d")!;
    this.ground = buildGround();
    this.player = { id: "player", x: start.x, y: start.y, dir: start.dir, moving: false, phase: 0 };
    this.npcs = (Object.keys(NPC_SPOTS) as NpcId[]).map((id) => ({ id, ...NPC_SPOTS[id], dir: "down" as Dir, moving: false, phase: Math.random() * 6 }));
    const srcs: Record<string, string> = {
      cyber_center: cyberImg, phishing_house: phishImg, account_house: accountImg, device_lab: deviceImg, tree: treeImg, fountain: fountainImg,
    };
    for (const c of ["player", "nara", "ardi", "dito", "sasa"] as CharId[])
      for (const d of ["down", "right", "up"] as const) srcs[`${c}_${d}`] = spriteSrc(c, d);
    for (const [k, src] of Object.entries(srcs)) { const im = new Image(); im.src = src; this.images.set(k, im); }
    const r = rng(11);
    for (const f of FLOWER_BEDS) {
      for (let i = 0; i < (f.w * f.h) / 70; i++) {
        this.flowers.push({ x: f.x + 4 + Math.floor(r() * (f.w - 8)), y: f.y + 4 + Math.floor(r() * (f.h - 8)), color: pick(FLOWER_COLORS, r()), ph: r() * 6 });
      }
    }
    for (let i = 0; i < 70; i++) {
      const x = Math.floor(r() * MAP_W), y = 120 + Math.floor(r() * (MAP_H - 220));
      if ([ROAD_H, ROAD_V, ...SIDEWALKS, ...PLAZAS].some((q) => inRect(x, y, q))) continue;
      this.flowers.push({ x, y, color: pick(FLOWER_COLORS, r()), ph: r() * 6 });
    }
    const spots: [number, number][] = [[560, 160], [1360, 300], [560, 640], [1420, 820], [900, 630], [620, 760]];
    spots.forEach(([cx, cy], i) => this.butterflies.push({ x: cx, y: cy, cx, cy, ph: i * 1.7, color: FLOWER_COLORS[i % FLOWER_COLORS.length]!, sp: 0.6 + r() * 0.6 }));
    for (let i = 0; i < 3; i++) this.clouds.push({ x: r() * MAP_W, y: 150 + r() * (MAP_H - 300), rx: 140 + r() * 80, ry: 60 + r() * 30, sp: 6 + r() * 6 });
    this.updateCamera();
  }

  private img(k: string) {
    const im = this.images.get(k);
    return im && im.complete && im.naturalWidth > 0 ? im : null;
  }

  private collides(x: number, y: number) {
    const box = { x: x - 9, y: y - 8, w: 18, h: 8 };
    if (box.x < 8 || box.x + box.w > MAP_W - 8) return true;
    if (this.solids.some((s) => overlap(box, s))) return true;
    return this.npcs.some((n) => overlap(box, { x: n.x - 11, y: n.y - 8, w: 22, h: 8 }));
  }

  private interactables(): Interactable[] {
    const list: Interactable[] = this.npcs.map((n) => ({ id: n.id, x: n.x, y: n.y, label: "Bicara" }));
    for (const d of DOORS) list.push({ id: d.id, x: d.x, y: d.y, label: "Masuk" });
    for (const s of SIGNS) list.push({ id: s.id, x: s.x, y: s.y, label: "Baca" });
    list.push({ id: "kiosk", x: KIOSK.x, y: KIOSK.y, label: "Periksa" });
    list.push({ id: "tower", x: TOWER.x, y: TOWER.y, label: "Periksa" });
    list.push({ id: "fountain", x: FOUNTAIN.x + 60, y: FOUNTAIN.y + 112, label: "Lihat" });
    return list;
  }

  update(dt: number) {
    this.t += dt;
    const p = this.player;
    let dx = 0, dy = 0;
    if (!this.frozen) {
      const k = this.keys;
      if (k.has("ArrowLeft") || k.has("a")) dx -= 1;
      if (k.has("ArrowRight") || k.has("d")) dx += 1;
      if (k.has("ArrowUp") || k.has("w")) dy -= 1;
      if (k.has("ArrowDown") || k.has("s")) dy += 1;
    }
    p.moving = dx !== 0 || dy !== 0;
    if (p.moving) {
      const horiz: Dir = dx < 0 ? "left" : "right";
      const vert: Dir = dy < 0 ? "up" : "down";
      if (dy === 0) p.dir = horiz;
      else if (dx === 0) p.dir = vert;
      else if (p.dir !== horiz && p.dir !== vert) p.dir = horiz;
      const len = Math.hypot(dx, dy);
      const speed = this.keys.has("Shift") ? 180 : 120;
      const vx = (dx / len) * speed * dt, vy = (dy / len) * speed * dt;
      if (!this.collides(p.x + vx, p.y)) p.x += vx;
      if (!this.collides(p.x, p.y + vy)) p.y += vy;
      p.y = Math.max(110, Math.min(MAP_H - 34, p.y));
      p.phase += dt * 14;
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) { this.stepTimer = this.keys.has("Shift") ? 0.22 : 0.3; this.onStep?.(); }
    } else {
      p.phase = 0;
      this.stepTimer = 0;
    }
    // NPCs face the player when close
    for (const n of this.npcs) {
      const d = Math.hypot(n.x - p.x, n.y - p.y);
      if (d < 90) {
        const ax = p.x - n.x, ay = p.y - n.y;
        n.dir = Math.abs(ax) > Math.abs(ay) ? (ax < 0 ? "left" : "right") : ay < 0 ? "up" : "down";
      } else n.dir = "down";
    }
    // nearest interactable
    let best: Interactable | null = null, bd = 54;
    for (const it of this.interactables()) {
      const d = Math.hypot(it.x - p.x, it.y - p.y);
      if (d < bd) { bd = d; best = it; }
    }
    if (best?.id !== this.near?.id) { this.near = best; this.onNear?.(best); }
    // zone banner
    const z = ZONES.find((zz) => inRect(p.x, p.y, zz))?.name ?? "";
    if (z !== this.zone) { this.zone = z; if (z) this.onZone?.(z); }
    // ambient
    for (const b of this.butterflies) {
      b.ph += dt * b.sp;
      b.x = b.cx + Math.sin(b.ph) * 46 + Math.sin(b.ph * 2.3) * 12;
      b.y = b.cy + Math.cos(b.ph * 0.8) * 26 + Math.sin(b.ph * 3.1) * 6;
    }
    for (const c of this.clouds) { c.x += c.sp * dt; if (c.x - c.rx > MAP_W) c.x = -c.rx; }
    if (Math.random() < dt * 30) {
      this.drops.push({ x: FOUNTAIN.x + 60, y: FOUNTAIN.y + 30, vx: (Math.random() - 0.5) * 50, vy: -60 - Math.random() * 40, life: 1 });
    }
    for (const d of this.drops) { d.vy += 180 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.life -= dt * 1.4; }
    this.drops = this.drops.filter((d) => d.life > 0 && d.y < FOUNTAIN.y + 60);
    this.updateCamera();
  }

  private updateCamera() {
    this.cam.x = Math.round(Math.max(0, Math.min(MAP_W - VIEW_W, this.player.x - VIEW_W / 2)));
    this.cam.y = Math.round(Math.max(0, Math.min(MAP_H - VIEW_H, this.player.y - 30 - VIEW_H / 2)));
  }

  // --- Rendering ---------------------------------------------------------
  render() {
    const g = this.ctx;
    g.imageSmoothingEnabled = false;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, VIEW_W, VIEW_H);
    g.setTransform(1, 0, 0, 1, -this.cam.x, -this.cam.y);
    g.drawImage(this.ground, 0, 0);
    this.drawFlowers();

    type Draw = { base: number; fn: () => void };
    const list: Draw[] = [];
    for (const b of BUILDINGS) list.push({ base: b.y + b.h - 4, fn: () => this.drawImg(b.key, b.x, b.y, b.w, b.h) });
    for (const t of TREES) list.push({ base: t.y, fn: () => this.drawTree(t.x, t.y) });
    list.push({ base: FOUNTAIN.y + FOUNTAIN.h - 6, fn: () => this.drawFountain() });
    for (const l of LAMPS) list.push({ base: l.y, fn: () => this.drawLamp(l.x, l.y) });
    for (const b of BENCHES) list.push({ base: b.y + b.h, fn: () => this.drawBench(b) });
    for (const b of BUSHES) list.push({ base: b.y, fn: () => this.drawBush(b.x, b.y) });
    for (const s of SIGNS) list.push({ base: s.y, fn: () => this.drawSign(s.x, s.y, s.label) });
    list.push({ base: KIOSK.y, fn: () => this.drawKiosk() });
    list.push({ base: TOWER.y, fn: () => this.drawTower() });
    for (const n of this.npcs) list.push({ base: n.y, fn: () => this.drawActor(n) });
    list.push({ base: this.player.y + 0.5, fn: () => this.drawActor(this.player) });
    list.sort((a, b) => a.base - b.base);
    for (const d of list) d.fn();

    this.drawButterflies();
    // cloud shadows drift over everything
    for (const c of this.clouds) {
      g.save();
      g.translate(c.x, c.y);
      g.scale(1, c.ry / c.rx);
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, c.rx);
      grad.addColorStop(0, "rgba(30, 40, 80, 0.08)");
      grad.addColorStop(1, "rgba(30, 40, 80, 0)");
      g.fillStyle = grad;
      g.beginPath(); g.arc(0, 0, c.rx, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    this.drawMarkers();
  }

  private drawImg(k: string, x: number, y: number, w: number, h: number) {
    const im = this.img(k);
    if (!im) return;
    const g = this.ctx;
    g.fillStyle = "rgba(20, 30, 60, 0.22)";
    g.beginPath(); g.ellipse(x + w / 2, y + h - 6, w * 0.48, 10, 0, 0, Math.PI * 2); g.fill();
    g.drawImage(im, x, y, w, h);
  }

  private drawTree(x: number, base: number) {
    const im = this.img("tree");
    if (!im) return;
    const g = this.ctx;
    g.fillStyle = "rgba(20, 40, 30, 0.25)";
    g.beginPath(); g.ellipse(x, base - 2, 26, 7, 0, 0, Math.PI * 2); g.fill();
    const sway = Math.round(Math.sin(this.t * 1.3 + x * 0.05) * 1);
    g.drawImage(im, 0, 0, im.width, 80, x - 42 + sway, base - 107, 84, 80);
    g.drawImage(im, 0, 80, im.width, im.height - 80, x - 42, base - 27, 84, im.height - 80);
  }

  private drawFountain() {
    const im = this.img("fountain");
    if (!im) return;
    const g = this.ctx;
    g.drawImage(im, FOUNTAIN.x, FOUNTAIN.y);
    for (const d of this.drops) {
      g.fillStyle = d.life > 0.5 ? "#dff6ff" : "#7fd8ff";
      g.fillRect(Math.round(d.x), Math.round(d.y), 2, 2);
    }
    const s = Math.floor(this.t * 4) % 3;
    g.fillStyle = "rgba(255,255,255,0.8)";
    g.fillRect(FOUNTAIN.x + 34 + s * 14, FOUNTAIN.y + 70 + s * 3, 3, 2);
    g.fillRect(FOUNTAIN.x + 80 - s * 10, FOUNTAIN.y + 84 - s * 2, 3, 2);
  }

  private drawFlowers() {
    const g = this.ctx;
    for (const f of this.flowers) {
      const sw = Math.sin(this.t * 2 + f.ph) > 0.3 ? 1 : 0;
      g.fillStyle = "#3f8a37"; g.fillRect(f.x, f.y, 1, 4);
      g.fillStyle = f.color;
      g.fillRect(f.x - 1 + sw, f.y - 2, 3, 3);
      g.fillStyle = "#ffe98a"; g.fillRect(f.x + sw, f.y - 1, 1, 1);
    }
  }

  private drawButterflies() {
    const g = this.ctx;
    for (const b of this.butterflies) {
      const flap = Math.sin(this.t * 18 + b.ph) > 0 ? 3 : 1;
      g.fillStyle = b.color;
      g.fillRect(Math.round(b.x) - flap, Math.round(b.y), flap, 3);
      g.fillRect(Math.round(b.x) + 1, Math.round(b.y), flap, 3);
      g.fillStyle = C.ink; g.fillRect(Math.round(b.x), Math.round(b.y), 1, 3);
    }
  }

  private drawLamp(x: number, base: number) {
    const g = this.ctx;
    g.fillStyle = "rgba(20,30,60,0.25)"; g.fillRect(x - 6, base - 2, 12, 3);
    g.fillStyle = C.ink; g.fillRect(x - 3, base - 6, 6, 6);
    g.fillStyle = C.navy; g.fillRect(x - 1, base - 52, 3, 48);
    g.fillStyle = C.ink; g.fillRect(x - 6, base - 60, 13, 3); g.fillRect(x - 5, base - 57, 11, 8);
    const pulse = 0.75 + Math.sin(this.t * 3 + x) * 0.15;
    g.fillStyle = `rgba(255, 226, 120, ${pulse})`; g.fillRect(x - 3, base - 56, 7, 6);
    const glow = g.createRadialGradient(x + 0.5, base - 53, 2, x + 0.5, base - 53, 14);
    glow.addColorStop(0, `rgba(255, 236, 160, ${0.35 * pulse})`);
    glow.addColorStop(1, "rgba(255, 236, 160, 0)");
    g.fillStyle = glow;
    g.beginPath(); g.arc(x + 0.5, base - 53, 14, 0, Math.PI * 2); g.fill();
  }

  private drawBench(b: Rect) {
    const g = this.ctx;
    g.fillStyle = "rgba(20,30,60,0.22)"; g.fillRect(b.x + 2, b.y + b.h - 2, b.w - 2, 4);
    g.fillStyle = C.ink; g.fillRect(b.x + 3, b.y + 12, 3, 8); g.fillRect(b.x + b.w - 6, b.y + 12, 3, 8);
    g.fillStyle = C.woodDark; g.fillRect(b.x, b.y, b.w, 14);
    g.fillStyle = C.wood; g.fillRect(b.x + 1, b.y + 1, b.w - 2, 4); g.fillRect(b.x + 1, b.y + 7, b.w - 2, 5);
    g.fillStyle = "#c48a52"; g.fillRect(b.x + 2, b.y + 1, b.w - 4, 1); g.fillRect(b.x + 2, b.y + 7, b.w - 4, 1);
  }

  private drawBush(x: number, base: number) {
    const g = this.ctx;
    g.fillStyle = "rgba(20,40,30,0.25)"; g.beginPath(); g.ellipse(x, base - 1, 16, 4, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2f6e2c"; g.beginPath(); g.arc(x - 7, base - 9, 9, 0, Math.PI * 2); g.arc(x + 7, base - 9, 9, 0, Math.PI * 2); g.arc(x, base - 15, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#4f9a3e"; g.beginPath(); g.arc(x - 6, base - 11, 6, 0, Math.PI * 2); g.arc(x + 3, base - 17, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#ff7aa8"; g.fillRect(x - 4, base - 14, 2, 2); g.fillRect(x + 6, base - 9, 2, 2);
  }

  private drawSign(x: number, base: number, label: string) {
    const g = this.ctx;
    g.font = "bold 9px 'Pixelify Sans', monospace";
    const w = Math.ceil(g.measureText(label).width) + 12;
    g.fillStyle = "rgba(20,30,60,0.25)"; g.fillRect(x - 5, base - 2, 10, 3);
    g.fillStyle = C.woodDark; g.fillRect(x - 2, base - 22, 4, 22);
    const bx = Math.round(x - w / 2), by = base - 38;
    g.fillStyle = C.ink; g.fillRect(bx - 1, by - 1, w + 2, 18);
    g.fillStyle = C.wood; g.fillRect(bx, by, w, 16);
    g.fillStyle = "#c48a52"; g.fillRect(bx + 1, by + 1, w - 2, 1);
    g.fillStyle = "#fff7e6"; g.textBaseline = "middle"; g.textAlign = "center";
    g.fillText(label, x, by + 8.5);
  }

  private drawKiosk() {
    const g = this.ctx, x = KIOSK.x, b = KIOSK.y;
    g.fillStyle = "rgba(20,30,60,0.25)"; g.fillRect(x - 14, b - 3, 28, 4);
    g.fillStyle = C.ink; g.fillRect(x - 12, b - 44, 24, 44);
    g.fillStyle = C.navy; g.fillRect(x - 11, b - 43, 22, 42);
    const glow = 0.7 + Math.sin(this.t * 2.5) * 0.3;
    g.fillStyle = `rgba(79, 214, 240, ${glow})`; g.fillRect(x - 8, b - 39, 16, 14);
    g.fillStyle = "#ffffff"; g.fillRect(x - 5, b - 35, 10, 2); g.fillRect(x - 5, b - 31, 6, 2);
    g.fillStyle = C.gold; g.fillRect(x - 3, b - 18, 6, 6);
  }

  private drawTower() {
    const g = this.ctx, x = TOWER.x, b = TOWER.y;
    g.fillStyle = "rgba(20,30,60,0.25)"; g.fillRect(x - 12, b - 3, 24, 4);
    g.fillStyle = C.ink; g.fillRect(x - 10, b - 8, 20, 8); g.fillRect(x - 2, b - 70, 4, 64);
    g.fillStyle = "#cfd8e6"; g.fillRect(x - 1, b - 68, 2, 60);
    g.fillStyle = C.cyan; g.fillRect(x - 3, b - 74, 6, 6);
    const k = (this.t * 0.8) % 1;
    g.strokeStyle = `rgba(79, 214, 240, ${1 - k})`; g.lineWidth = 2;
    for (const r0 of [6, 14]) { g.beginPath(); g.arc(x, b - 71, r0 + k * 10, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  }

  private drawActor(a: Actor) {
    const dir = a.dir === "left" ? "right" : a.dir;
    const im = this.img(`${a.id}_${dir}`);
    const g = this.ctx;
    g.fillStyle = "rgba(20, 30, 60, 0.3)";
    g.beginPath(); g.ellipse(Math.round(a.x), Math.round(a.y) - 1, 13, 4, 0, 0, Math.PI * 2); g.fill();
    if (!im) return;
    const moving = a.moving;
    const bob = moving ? Math.round(Math.abs(Math.sin(a.phase)) * 3) : Math.sin(this.t * 2.2 + a.phase) > 0.5 ? 1 : 0;
    const lean = moving ? Math.sin(a.phase) * 0.06 : 0;
    const x = Math.round(a.x), y = Math.round(a.y);
    g.save();
    g.translate(x, y);
    g.rotate(lean);
    if (a.dir === "left") g.scale(-1, 1);
    const h = im.height - (moving && bob === 0 ? 1 : 0);
    g.drawImage(im, -Math.round(im.width / 2), -h - bob, im.width, h);
    g.restore();
  }

  private drawMarkers() {
    const g = this.ctx;
    for (const n of this.npcs) {
      const m = this.markers[n.id as NpcId];
      if (!m) continue;
      const bounce = Math.round(Math.abs(Math.sin(this.t * 3)) * 4);
      const x = Math.round(n.x), y = Math.round(n.y) - 78 - bounce;
      if (m === "mission") {
        g.fillStyle = C.ink; g.fillRect(x - 7, y - 9, 14, 20);
        g.fillStyle = C.gold; g.fillRect(x - 6, y - 8, 12, 18);
        g.fillStyle = C.ink; g.fillRect(x - 1, y - 5, 3, 8); g.fillRect(x - 1, y + 5, 3, 3);
      } else {
        g.fillStyle = C.ink; g.fillRect(x - 7, y - 3, 14, 12);
        g.fillStyle = "#4cc46f"; g.fillRect(x - 6, y - 2, 12, 10);
        g.fillStyle = "#ffffff"; g.fillRect(x - 3, y + 3, 2, 2); g.fillRect(x - 1, y + 4, 2, 2); g.fillRect(x + 1, y + 1, 2, 3);
      }
    }
    if (this.near && !this.frozen) {
      const it = this.near;
      const isNpc = this.npcs.some((n) => n.id === it.id);
      const x = Math.round(it.x), y = Math.round(it.y) - (isNpc ? 70 : 50);
      g.font = "bold 10px 'Pixelify Sans', monospace";
      const text = `E  ${it.label}`;
      const w = Math.ceil(g.measureText(text).width) + 14;
      const bx = x - Math.round(w / 2) + 18;
      g.fillStyle = C.ink; g.fillRect(bx - 1, y - 1, w + 2, 18);
      g.fillStyle = "#ffffff"; g.fillRect(bx, y, w, 16);
      g.fillStyle = C.navy; g.fillRect(bx + 2, y + 2, 12, 12);
      g.fillStyle = "#ffffff"; g.textAlign = "left"; g.textBaseline = "middle";
      g.fillText("E", bx + 5, y + 8.5);
      g.fillStyle = C.navy; g.fillText(it.label, bx + 18, y + 8.5);
    }
  }
}
