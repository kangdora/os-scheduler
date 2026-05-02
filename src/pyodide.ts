import type { PyodideInterface } from "./types";

import mainPy from "../simulator/main.py?raw";
import schedulerPy from "../simulator/scheduler.py?raw";
import modelsPy from "../simulator/models.py?raw";
import utilPy from "../simulator/util.py?raw";
import coreSpecPy from "../simulator/core_spec.py?raw";
import algoInitPy from "../simulator/algorithm/__init__.py?raw";
import fcfsPy from "../simulator/algorithm/fcfs.py?raw";
import rrPy from "../simulator/algorithm/rr.py?raw";
import hrrnPy from "../simulator/algorithm/hrrn.py?raw";
import spnPy from "../simulator/algorithm/spn.py?raw";
import srtnPy from "../simulator/algorithm/srtn.py?raw";
import dietPy from "../simulator/algorithm/diet.py?raw";

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise: Promise<PyodideInterface> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script load failed")));
      return;
    }
    const tag = document.createElement("script");
    tag.src = src;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error("script load failed"));
    document.head.appendChild(tag);
  });
}

async function bootstrapPyodide(): Promise<PyodideInterface> {
  await loadScript(`${PYODIDE_BASE}pyodide.js`);
  if (!window.loadPyodide) throw new Error("Pyodide failed to attach to window");
  const py = await window.loadPyodide({ indexURL: PYODIDE_BASE });

  py.FS.mkdirTree("/home/pyodide/simulator/algorithm");
  py.FS.writeFile("/home/pyodide/simulator/__init__.py", "");
  py.FS.writeFile("/home/pyodide/simulator/main.py", mainPy);
  py.FS.writeFile("/home/pyodide/simulator/scheduler.py", schedulerPy);
  py.FS.writeFile("/home/pyodide/simulator/models.py", modelsPy);
  py.FS.writeFile("/home/pyodide/simulator/util.py", utilPy);
  py.FS.writeFile("/home/pyodide/simulator/core_spec.py", coreSpecPy);
  py.FS.writeFile("/home/pyodide/simulator/algorithm/__init__.py", algoInitPy);
  py.FS.writeFile("/home/pyodide/simulator/algorithm/fcfs.py", fcfsPy);
  py.FS.writeFile("/home/pyodide/simulator/algorithm/rr.py", rrPy);
  py.FS.writeFile("/home/pyodide/simulator/algorithm/hrrn.py", hrrnPy);
  py.FS.writeFile("/home/pyodide/simulator/algorithm/spn.py", spnPy);
  py.FS.writeFile("/home/pyodide/simulator/algorithm/srtn.py", srtnPy);
  py.FS.writeFile("/home/pyodide/simulator/algorithm/diet.py", dietPy);

  py.runPython(`
import sys, json
if "/home/pyodide" not in sys.path:
    sys.path.insert(0, "/home/pyodide")
from simulator.main import app
from simulator.util import to_jsonable

def __run_simulation(req_json_str):
    req = json.loads(req_json_str)
    res = app.run(req)
    return json.dumps(to_jsonable(res), ensure_ascii=False)
`);

  return py;
}

export function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = bootstrapPyodide().catch((err) => {
      pyodidePromise = null;
      throw err;
    });
  }
  return pyodidePromise;
}

export interface SimRequest {
  algorithm: string;
  processes: Array<{
    pid: string;
    arrival_time: number;
    burst_time: number;
    appetite: number;
  }>;
  cores: Array<{ core_id: string; core_type: "P" | "E" }>;
  time_quantum: number;
}

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

export interface ScheduleResult {
  timeline: ExecutionBlock[];
  process_metrics: ProcessMetric[];
  avg_wt: number;
  avg_ntt: number;
  total_energy: number;
  max_time: number;
}

export interface SimResponse {
  ok: boolean;
  data: ScheduleResult | null;
  error: { message: string } | null;
}

export async function runSimulation(req: SimRequest): Promise<SimResponse> {
  const py = await getPyodide();
  py.globals.set("__req_json", JSON.stringify(req));
  const out = py.runPython("__run_simulation(__req_json)") as string;
  return JSON.parse(out) as SimResponse;
}
