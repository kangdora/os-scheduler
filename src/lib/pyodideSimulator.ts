import type { PyodideInstance, Request, Response } from "../types";
import simulatorCoreSpecPy from "../pyodide-simulator/core_spec.py?raw";
import simulatorMainPy from "../pyodide-simulator/main.py?raw";
import simulatorModelsPy from "../pyodide-simulator/models.py?raw";
import simulatorSchedulerPy from "../pyodide-simulator/scheduler.py?raw";
import simulatorUtilPy from "../pyodide-simulator/util.py?raw";
import algorithmInitPy from "../pyodide-simulator/algorithm/__init__.py?raw";
import fcfsPy from "../pyodide-simulator/algorithm/fcfs.py?raw";
import rrPy from "../pyodide-simulator/algorithm/rr.py?raw";
import hrrnPy from "../pyodide-simulator/algorithm/hrrn.py?raw";
import spnPy from "../pyodide-simulator/algorithm/spn.py?raw";
import srtnPy from "../pyodide-simulator/algorithm/srtn.py?raw";
import dietPy from "../pyodide-simulator/algorithm/diet.py?raw";

const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.29.3/full/";
const PYODIDE_SCRIPT_URL = `${PYODIDE_INDEX_URL}pyodide.js`;

let pyodidePromise: Promise<PyodideInstance> | null = null;

const pythonFiles = [
  { path: "/app/simulator/core_spec.py", content: simulatorCoreSpecPy },
  { path: "/app/simulator/main.py", content: simulatorMainPy },
  { path: "/app/simulator/models.py", content: simulatorModelsPy },
  { path: "/app/simulator/scheduler.py", content: simulatorSchedulerPy },
  { path: "/app/simulator/util.py", content: simulatorUtilPy },
  { path: "/app/simulator/algorithm/__init__.py", content: algorithmInitPy },
  { path: "/app/simulator/algorithm/fcfs.py", content: fcfsPy },
  { path: "/app/simulator/algorithm/rr.py", content: rrPy },
  { path: "/app/simulator/algorithm/hrrn.py", content: hrrnPy },
  { path: "/app/simulator/algorithm/spn.py", content: spnPy },
  { path: "/app/simulator/algorithm/srtn.py", content: srtnPy },
  { path: "/app/simulator/algorithm/diet.py", content: dietPy },
];

function ensureDirectory(pyodide: PyodideInstance, path: string) {
  const parts = path.split("/").filter(Boolean);
  let current = "";

  for (const part of parts) {
    current += `/${part}`;
    if (!pyodide.FS.analyzePath(current).exists) {
      pyodide.FS.mkdir(current);
    }
  }
}

async function ensurePyodideScript() {
  if (window.loadPyodide) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PYODIDE_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Pyodide script load failed.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = PYODIDE_SCRIPT_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Pyodide script load failed."));
    document.head.appendChild(script);
  });
}

async function initializePyodide() {
  await ensurePyodideScript();

  if (!window.loadPyodide) {
    throw new Error("loadPyodide is not available on window.");
  }

  const pyodide = await window.loadPyodide({ indexURL: PYODIDE_INDEX_URL });

  ensureDirectory(pyodide, "/app/simulator/algorithm");

  for (const file of pythonFiles) {
    pyodide.FS.writeFile(file.path, file.content);
  }

  await pyodide.runPythonAsync(`
import sys
sys.path.insert(0, "/app")
import json
from simulator.main import app
from simulator.util import to_json

def run_scheduler(request_json_text):
    request_json = json.loads(request_json_text)
    return to_json(app.run(request_json))
  `);

  return pyodide;
}

export async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = initializePyodide();
  }

  return pyodidePromise;
}

export async function runSimulator(request: Request): Promise<Response> {
  const pyodide = await getPyodide();
  pyodide.globals.set("request_json_text", JSON.stringify(request));
  const responseText = await pyodide.runPythonAsync("run_scheduler(request_json_text)");

  return JSON.parse(String(responseText)) as Response;
}
