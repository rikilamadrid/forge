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
import { PAINTS, detectTerminal, renderCliIdentity } from "./identity.js";

export interface TerminalEnvironment {
  readonly [key: string]: string | undefined;
}

const RESET = "\u001B[0m";
const BOLD = "\u001B[1m";
const DIM = "\u001B[2m";
const ANSI: Readonly<Record<string, number>> = { black: 30, red: 31, green: 32, yellow: 33, blue: 34, magenta: 35, cyan: 36, white: 37 };
const SEVERITY = Object.freeze({ ok: "green", info: "cyan", warn: "yellow", bad: "red" });

/**
 * The quench rule: the identity's one structural mark in human output. Eight hot cells
 * carry the brand, sixteen quenched cells are dimmed, and the whole rule is exactly
 * twenty-four columns wide so it never wraps in a terminal that can hold it.
 */
export const QUENCH_RULE_COLUMNS = 24;
export const QUENCH_RULE_HOT_COLUMNS = 8;
const QUENCH_RULE_CELL = "\u2500";

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
  /** The approved shared grammar. Forge ships line form only for now. */
  identityLine(version: string): string;
  /**
   * The quench rule, or "" when this run must not show one: colour off, or a terminal
   * too narrow to hold twenty-four columns. Returning "" rather than a shorter rule is
   * deliberate — a rule that wraps is worse than no rule, and a rule that shrinks is a
   * second, unmeasured mark.
   */
  quenchRule(columns?: number): string;
}

export function createTerminal(
  env: TerminalEnvironment,
  isTTY: boolean,
  columns?: number,
  platform?: string,
): Terminal {
  const caps = detectTerminal({
    env,
    isTTY,
    ...(columns === undefined ? {} : { columns }),
    ...(platform === undefined ? {} : { platform }),
  });
  const color = caps.tier !== "contract" && caps.depth !== 0;
  const depth = color ? caps.depth : 0;
  const wrap = (open: string) => (text: string) => (color ? `${open}${text}${RESET}` : text);
  const severity = (name: string) => wrap(`\u001B[${ANSI[name] ?? 39}m`);
  const brandOpen = depth === 24 ? PAINTS.accent.truecolor : depth === 8 ? PAINTS.accent.ansi256 : PAINTS.accent.ansi16;
  const brand = wrap(brandOpen);
  const dim = wrap(DIM);
  return Object.freeze({
    color,
    depth,
    brand,
    bold: wrap(BOLD),
    dim,
    bad: severity(SEVERITY.bad),
    ok: severity(SEVERITY.ok),
    identityLine: (version: string) =>
      renderCliIdentity({ version, caps, form: "line" }),
    quenchRule: (columns?: number) => {
      // Gated on colour, so piped, NO_COLOR and TERM=dumb output keeps every byte it
      // had in 0.1.2. An unknown width is not a narrow terminal: colour was forced
      // onto something that is not a TTY, and nothing there wraps.
      if (!color) return "";
      if (columns !== undefined && columns < QUENCH_RULE_COLUMNS) return "";
      const hot = QUENCH_RULE_CELL.repeat(QUENCH_RULE_HOT_COLUMNS);
      const quenched = QUENCH_RULE_CELL.repeat(QUENCH_RULE_COLUMNS - QUENCH_RULE_HOT_COLUMNS);
      return `${brand(hot)}${dim(quenched)}`;
    },
  });
}
