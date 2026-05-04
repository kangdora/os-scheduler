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
  const statusByPid = new Map<string, ProcStatus>();

  // 각 프로세스별로 '진짜 마지막 종료 시각'을 먼저 구합니다.
  const lastEndTimeByPid = new Map<string, number>();
  for (const b of timeline) {
    if (!b.pid) continue;
    const currentMax = lastEndTimeByPid.get(b.pid) ?? 0;
    if (b.end_time > currentMax) {
      lastEndTimeByPid.set(b.pid, b.end_time)
    }
    // 현제 실행 중인 코어 확인
    if (b.start_time <= tick && tick < b.end_time) {
      runningByCore.set(b.processor_id, b.pid);
    }
  }

  const runningPids = new Set(runningByCore.values());

  // 진짜 마지막 종료 시각이 현재 tick보다 작거나 같을 때만 완료로 간주
  for (const [pid, lastEnd] of lastEndTimeByPid) {
    if (lastEnd <= tick) {
      completedPids.add(pid);
    }
  }

  const arrived = processes.filter((p) => p.arrivalTime <= tick);
  const ready = arrived
    .filter((p) => !runningPids.has(p.pid) && !completedPids.has(p.pid))
    .sort((a, b) => a.arrivalTime - b.arrivalTime || a.pid.localeCompare(b.pid))
    .map((p) => p.pid);

  for (const p of processes) {
    if (completedPids.has(p.pid)) statusByPid.set(p.pid, "done");
    else if (runningPids.has(p.pid)) statusByPid.set(p.pid, "running");
    else statusByPid.set(p.pid, "waiting");
  }

  if (finished) {
    for (const p of processes) statusByPid.set(p.pid, "done");
  }

  return { runningByCore, readyPids: ready, sleepPids: [], statusByPid };
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
