export const MAX_PROCESSES = 15;
export const READY_QUEUE_VISIBLE = 5;
export const CPU_COUNT = 4;

export const ALGORITHMS = [
  { id: "fcfs", label: "FCFS (선착순)" },
  { id: "rr", label: "Round Robin (RR)" },
  { id: "hrrn", label: "HRRN" },
  { id: "spn", label: "SPN" },
  { id: "srtn", label: "SRTN" },
  { id: "diet", label: "Diet (다이어트)" },
] as const;

export type AlgorithmId = (typeof ALGORITHMS)[number]["id"];

export interface ProcessColor {
  bg: string;
  border: string;
  pill: string;
}

export const PROCESS_COLORS: ProcessColor[] = [
  { bg: "#fde2e4", border: "#f6b6bb", pill: "#e98695" },
  { bg: "#fde6c4", border: "#f6c98a", pill: "#e8a25f" },
  { bg: "#fff3b8", border: "#f1d96b", pill: "#d8b234" },
  { bg: "#dff5c5", border: "#a9d77f", pill: "#7eb654" },
  { bg: "#c7ecd0", border: "#86c99e", pill: "#5aa57a" },
  { bg: "#cfeff0", border: "#7cc8cc", pill: "#56a4a8" },
  { bg: "#cfe3f9", border: "#85b4ec", pill: "#5a91d4" },
  { bg: "#dcd6f7", border: "#a8a0e6", pill: "#7d74cf" },
  { bg: "#f1d4f5", border: "#cf9ad7", pill: "#a872b3" },
  { bg: "#f9d4e3", border: "#dd9bb6", pill: "#bc7393" },
  { bg: "#f6dfc1", border: "#dfb481", pill: "#b58853" },
  { bg: "#e7e2cd", border: "#bdb38a", pill: "#8d8253" },
  { bg: "#d2eadf", border: "#84beaa", pill: "#5b9a82" },
  { bg: "#e1d4ee", border: "#b298d0", pill: "#85669f" },
  { bg: "#fcdcdc", border: "#e8a7ac", pill: "#c87478" },
];

export const CPU_COLORS: ProcessColor[] = [
  { bg: "#fde2e4", border: "#f6b6bb", pill: "#e98695" },
  { bg: "#fde6c4", border: "#f6c98a", pill: "#e8a25f" },
  { bg: "#cfe3f9", border: "#85b4ec", pill: "#5a91d4" },
  { bg: "#dff5c5", border: "#a9d77f", pill: "#7eb654" },
];

export const HAMSTER_NAMES = [
  "뽀송이", "방울이", "모찌", "솜이", "꼬미",
  "구름이", "루루", "보보", "토토", "달콩이",
  "초코", "크림", "코코아", "밀키", "밤이",
  "피넛", "치즈", "감자", "젤리", "쿠키",
];
