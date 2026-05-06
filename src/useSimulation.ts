import { useEffect, useRef, useState } from "react";
import type { ExecutionBlock, ScheduleResult } from "./pyodide";
import type { ProcessUI } from "./state";
import type { ProcStatus } from "./components/ResultTable";
import type { SimState } from "./components/AlgorithmPanel";

interface DerivedState {
  runningByCore: Map<string, string>;
  readyPids: string[];
  sleepPids: string[];
  statusByPid: Map<string, ProcStatus>;
}

export function deriveAtTick(
  tick: number,
  processes: ProcessUI[],
  timeline: ExecutionBlock[],
  finished: boolean,
): DerivedState {
  const runningByCore = new Map<string, string>();
  const completedPids = new Set<string>();
  const sleepPids = new Set<string>();
  const statusByPid = new Map<string, ProcStatus>();

  for (const b of timeline) {
    if (!b.pid) continue;
    if (b.processor_id === "eating_queue") {
      if (b.start_time <= tick && tick < b.end_time) {
        sleepPids.add(b.pid);
      }
      continue;
    }

    if (b.start_time <= tick && tick < b.end_time) {
      runningByCore.set(b.processor_id, b.pid);
    }
    if (b.end_time <= tick) completedPids.add(b.pid);
  }

  const runningPids = new Set(runningByCore.values());

  const arrived = processes.filter((p) => p.arrivalTime <= tick);
  const ready = arrived
    .filter((p) => !runningPids.has(p.pid) && !sleepPids.has(p.pid) && !completedPids.has(p.pid))
    .sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid.localeCompare(b.pid))
    .map((p) => p.pid);

  for (const p of processes) {
    if (completedPids.has(p.pid)) statusByPid.set(p.pid, "done");
    else if (runningPids.has(p.pid)) statusByPid.set(p.pid, "running");
    else if (sleepPids.has(p.pid)) statusByPid.set(p.pid, "sleep");
    else statusByPid.set(p.pid, "waiting");
  }

  if (finished) {
    for (const p of processes) statusByPid.set(p.pid, "done");
  }

  return { runningByCore, readyPids: ready, sleepPids: Array.from(sleepPids), statusByPid };
}

interface UseSimulationArgs {
  result: ScheduleResult | null;
  intervalMs: number;
}

export function useSimulationPlayback({ result, intervalMs }: UseSimulationArgs) {
  const [tick, setTick] = useState(0);
  const [simState, setSimState] = useState<SimState>("idle");
  const timerRef = useRef<number | null>(null);

  const stop = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => stop(), []);

  useEffect(() => {
    if (simState !== "running" || !result) {
      stop();
      return;
    }
    stop();
    timerRef.current = window.setInterval(() => {
      setTick((t) => {
        const next = t + 1;
        if (next >= result.max_time) {
          stop();
          setSimState("finished");
          return result.max_time;
        }
        return next;
      });
    }, intervalMs);
    return stop;
  }, [simState, intervalMs, result]);

  const start = (r: ScheduleResult) => {
    setTick(0);
    if (r.max_time === 0) {
      setSimState("finished");
    } else {
      setSimState("running");
    }
  };
  const pause = () => setSimState("paused");
  const resume = () => {
    if (!result) return;
    if (tick >= result.max_time) {
      setSimState("finished");
      return;
    }
    setSimState("running");
  };
  const reset = () => {
    stop();
    setTick(0);
    setSimState("idle");
  };

  return { tick, simState, start, pause, resume, reset };
}
