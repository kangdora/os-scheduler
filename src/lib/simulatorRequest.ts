import type { CoreRow, ProcessRow, Request, AlgorithmKey } from "../types";

export function buildSimulatorRequest(input: {
  algorithm: AlgorithmKey;
  processes: ProcessRow[];
  cores: CoreRow[];
  timeQuantum: number;
}): Request {
  return {
    algorithm: input.algorithm,
    processes: input.processes.map((process) => ({
      pid: process.pid,
      arrival_time: process.at,
      burst_time: process.bt,
    })),
    time_quantum: input.algorithm === "rr" ? input.timeQuantum : null,
    cores: input.cores.map((core) => ({
      core_id: core.core_id,
      core_type: core.core_type,
    })),
  };
}
