import type { NpcId } from "./data/cases";

const files = import.meta.glob("../assets/sprites/*.png", { eager: true, import: "default" }) as Record<string, string>;

export type CharId = "player" | NpcId;
export type SpriteDir = "down" | "right" | "up" | "portrait";

export const spriteSrc = (c: CharId, d: SpriteDir): string => files[`../assets/sprites/${c}_${d}.png`] ?? "";
export const portraitSrc = (c: CharId) => spriteSrc(c, "portrait");
