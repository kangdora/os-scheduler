import type { AlgorithmId } from "../constants";
import type { CoreUI, ProcessUI } from "../state";
import type { Request } from "../types";

export function buildSimulatorRequest(input: {
  algorithm: AlgorithmId;
  processes: ProcessUI[];
  cores: CoreUI[];
  timeQuantum: number;
}): Request {
  const cores = input.cores.map((core) => ({
    core_id: core.coreId,
    core_type: core.coreType,
  }));

  if (input.algorithm === "diet") {
    return {
      algorithm: input.algorithm,
      processes: input.processes.map((process) => ({
        pid: process.pid,
        arrival_time: process.arrivalTime,
        burst_time: process.burstTime,
        appetite: process.appetite,
      })),
      time_quantum: null,
      cores,
    };
  }

  return {
    algorithm: input.algorithm,
    processes: input.processes.map((process) => ({
      pid: process.pid,
      arrival_time: process.arrivalTime,
      burst_time: process.burstTime,
    })),
    time_quantum: input.algorithm === "rr" ? input.timeQuantum : null,
    cores,
  };
}
