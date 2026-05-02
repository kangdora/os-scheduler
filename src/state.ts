import { CPU_COLORS, CPU_COUNT, HAMSTER_NAMES, PROCESS_COLORS } from "./constants";

export interface ProcessUI {
  pid: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  appetite: number;
  colorIdx: number;
}

export interface CoreUI {
  coreId: string;
  coreType: "P" | "E";
  enabled: boolean;
  colorIdx: number;
}

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickAvailable<T>(pool: T[], used: Set<T>): T {
  const remaining = pool.filter((p) => !used.has(p));
  if (remaining.length === 0) return pool[Math.floor(Math.random() * pool.length)];
  return remaining[Math.floor(Math.random() * remaining.length)];
}

export function nextPid(processes: ProcessUI[]): string {
  const used = new Set(processes.map((p) => p.pid));
  for (let i = 1; i <= 99; i++) {
    const candidate = `P${i}`;
    if (!used.has(candidate)) return candidate;
  }
  return `P${processes.length + 1}`;
}

export function nextColorIdx(processes: ProcessUI[]): number {
  const used = new Set(processes.map((p) => p.colorIdx));
  const available: number[] = [];
  for (let i = 0; i < PROCESS_COLORS.length; i++) {
    if (!used.has(i)) available.push(i);
  }
  if (available.length === 0) return Math.floor(Math.random() * PROCESS_COLORS.length);
  return available[Math.floor(Math.random() * available.length)];
}

export function nextHamsterName(processes: ProcessUI[]): string {
  const usedNames = new Set(processes.map((p) => p.name));
  const available = HAMSTER_NAMES.filter((n) => !usedNames.has(n));
  if (available.length === 0) {
    return HAMSTER_NAMES[Math.floor(Math.random() * HAMSTER_NAMES.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

export function makeBlankProcess(processes: ProcessUI[]): ProcessUI {
  return {
    pid: nextPid(processes),
    name: nextHamsterName(processes),
    arrivalTime: 0,
    burstTime: 1,
    appetite: 0,
    colorIdx: nextColorIdx(processes),
  };
}

export function makeRandomProcess(processes: ProcessUI[]): ProcessUI {
  const at = Math.floor(Math.random() * 8);
  const bt = Math.floor(Math.random() * 9) + 1;
  const appetite = Math.floor(Math.random() * 101);
  return {
    pid: nextPid(processes),
    name: nextHamsterName(processes),
    arrivalTime: at,
    burstTime: bt,
    appetite,
    colorIdx: nextColorIdx(processes),
  };
}

export function defaultCores(): CoreUI[] {
  return Array.from({ length: CPU_COUNT }, (_, i) => ({
    coreId: `CPU${i + 1}`,
    coreType: i < 2 ? "P" : "E",
    enabled: true,
    colorIdx: i % CPU_COLORS.length,
  }));
}

export function defaultProcesses(): ProcessUI[] {
  return [
    { pid: "P1", name: "뽀송이", arrivalTime: 0, burstTime: 8, appetite: 20, colorIdx: 0 },
    { pid: "P2", name: "모찌", arrivalTime: 1, burstTime: 4, appetite: 35, colorIdx: 1 },
    { pid: "P3", name: "구름이", arrivalTime: 2, burstTime: 9, appetite: 50, colorIdx: 6 },
    { pid: "P4", name: "토토", arrivalTime: 3, burstTime: 5, appetite: 10, colorIdx: 3 },
  ];
}
