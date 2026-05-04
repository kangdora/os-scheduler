import type { AlgorithmId } from "./constants";

export interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    set: (name: string, value: unknown) => void;
    get: (name: string) => unknown;
  };
  FS: {
    mkdirTree: (path: string) => void;
    mkdir: (path: string) => void;
    writeFile: (path: string, data: string) => void;
    analyzePath: (path: string) => { exists: boolean };
  };
}

export type PyodideInstance = PyodideInterface;

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

export interface SimulatorProcess {
  pid: string;
  arrival_time: number;
  burst_time: number;
}

export interface DietSimulatorProcess extends SimulatorProcess {
  appetite: number;
}

export interface SimulatorCore {
  core_id: string;
  core_type: "P" | "E";
}

export interface BaseSimulatorRequest {
  cores: SimulatorCore[];
  time_quantum: number | null;
}

export interface GeneralSimulatorRequest extends BaseSimulatorRequest {
  algorithm: Exclude<AlgorithmId, "diet">;
  processes: SimulatorProcess[];
}

export interface DietSimulatorRequest extends BaseSimulatorRequest {
  algorithm: "diet";
  processes: DietSimulatorProcess[];
}

export type SimRequest = GeneralSimulatorRequest | DietSimulatorRequest;
export type Request = SimRequest;

export interface ExecutionBlock {
  processor_id: string;
  pid: string | null;
  start_time: number;
  end_time: number;
}

export interface ProcessMetric {
  pid: string;
  at: number;
  tt: number;
  wt: number;
  ntt: number;
}

export interface ReadyQueuePriority {
  pid: string;
  priority: number;
  enter_bonus: number;
  score: number;
}

export interface ReadyQueuePrioritySnapshot {
  time: number;
  items: ReadyQueuePriority[];
}

export interface ScheduleResult {
  timeline: ExecutionBlock[];
  process_metrics: ProcessMetric[];
  avg_wt: number;
  avg_ntt: number;
  total_energy: number;
  max_time: number;
  ready_queue_priorities: ReadyQueuePrioritySnapshot[];
}

export interface SimResponse {
  ok: boolean;
  data: ScheduleResult | null;
  error: { message: string } | null;
}

export type Response = SimResponse;
