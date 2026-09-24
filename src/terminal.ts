/**
 * Every decorated byte the CLI can emit, decided once from what the process observed.
 *
 * Three properties hold: the paints are total functions (plain text when colour is off);
 * the module is pure (it reads `{ env, isTTY }` and nothing else); and it decorates
 * rather than draws (no timer, no cursor movement, no state). Severity uses the eight
 * ANSI colours, which render the same everywhere. The one identity colour comes from
 * `identity.ts`, generated from the Wonder Wagon theme, at whatever depth the terminal
 * claimed — and machine-readable output (`--json`) never passes through here at all.
 */
import { BRAND, SEVERITY } from "./identity.js";

export interface TerminalEnvironment {
  readonly [key: string]: string | undefined;
}

const RESET = "\u001B[0m";
const BOLD = "\u001B[1m";
const DIM = "\u001B[2m";
const ANSI: Readonly<Record<string, number>> = { black: 30, red: 31, green: 32, yellow: 33, blue: 34, magenta: 35, cyan: 36, white: 37 };

/**
 * May this run emit colour? A sequence of refusals ending in the default: FORCE_COLOR=0
 * and NO_COLOR win, TERM=dumb is the terminal telling us what it is, FORCE_COLOR
 * otherwise turns colour on without a TTY, else colour iff this is a terminal.
 */
export function detectColor(env: TerminalEnvironment, isTTY: boolean): boolean {
  if (env.FORCE_COLOR === "0") return false;
  if (env.NO_COLOR !== undefined) return false;
  if (env.TERM === "dumb") return false;
  if (env.FORCE_COLOR !== undefined) return true;
  return isTTY;
}

/** 0, 4, 8 or 24 bits, from what the environment volunteers. Nothing is probed. */
export function detectColorDepth(env: TerminalEnvironment, color: boolean): 0 | 4 | 8 | 24 {
  if (!color) return 0;
  if (env.FORCE_COLOR === "3") return 24;
  if (env.FORCE_COLOR === "2") return 8;
  if (/^(truecolor|24bit)$/i.test(env.COLORTERM ?? "")) return 24;
  if (/-direct$/i.test(env.TERM ?? "")) return 24;
  if (/256color/i.test(env.TERM ?? "")) return 8;
  return 4;
}

export interface Terminal {
  readonly color: boolean;
  readonly depth: 0 | 4 | 8 | 24;
  /** Identity: bronze, in the alphabet this terminal speaks. */
  brand(text: string): string;
  bold(text: string): string;
  dim(text: string): string;
  /** Severity, by meaning. Never a brand colour. */
  bad(text: string): string;
  ok(text: string): string;
}

export function createTerminal(env: TerminalEnvironment, isTTY: boolean): Terminal {
  const color = detectColor(env, isTTY);
  const depth = detectColorDepth(env, color);
  const wrap = (open: string) => (text: string) => (color ? `${open}${text}${RESET}` : text);
  const severity = (name: string) => wrap(`\u001B[${ANSI[name] ?? 39}m`);
  const brandOpen = depth === 24 ? BRAND.truecolor : depth === 8 ? BRAND.ansi256 : BRAND.ansi16;
  return Object.freeze({
    color,
    depth,
    brand: wrap(brandOpen),
    bold: wrap(BOLD),
    dim: wrap(DIM),
    bad: severity(SEVERITY.bad),
    ok: severity(SEVERITY.ok),
  });
}
