import { MAX_PROCESSES, PROCESS_COLORS } from "../constants";
import type { ProcessUI } from "../state";
import { makeBlankProcess, makeRandomProcess } from "../state";

interface ProcessBoxProps {
  processes: ProcessUI[];
  setProcesses: (next: ProcessUI[]) => void;
  disabled: boolean;
}

function clampInt(v: string, min: number, max: number): number {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export default function ProcessBox({ processes, setProcesses, disabled }: ProcessBoxProps) {
  const full = processes.length >= MAX_PROCESSES;

  const update = (idx: number, patch: Partial<ProcessUI>) => {
    setProcesses(processes.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };
  const remove = (idx: number) => {
    setProcesses(processes.filter((_, i) => i !== idx));
  };
  const addBlank = () => {
    if (full) return;
    setProcesses([...processes, makeBlankProcess(processes)]);
  };
  const addRandom = () => {
    if (full) return;
    setProcesses([...processes, makeRandomProcess(processes)]);
  };

  return (
    <section className="card">
      <div className="card__title card__title--row">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span aria-hidden>🐹</span>
          <span>프로세스 목록</span>
          <span style={{ color: "var(--muted)", fontSize: 12, fontWeight: 500 }}>
            ({processes.length}/{MAX_PROCESSES})
          </span>
        </div>
        <div className="card__title__actions">
          <button className="btn" onClick={addBlank} disabled={disabled || full}>
            + 추가
          </button>
          <button className="btn" onClick={addRandom} disabled={disabled || full}>
            🎲 랜덤 추가
          </button>
        </div>
      </div>

      <div className="proc-table-wrap">
        <table className="proc-table">
          <thead>
            <tr>
              <th>PID</th>
              <th>이름</th>
              <th>AT</th>
              <th>BT</th>
              <th>우선순위</th>
              <th>식탐</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p, idx) => {
              const color = PROCESS_COLORS[p.colorIdx % PROCESS_COLORS.length];
              return (
                <tr key={p.pid}>
                  <td>
                    <span className="pid-pill" style={{ background: color.pill }}>{p.pid}</span>
                  </td>
                  <td>
                    <input
                      className="cell-input cell-input--name"
                      value={p.name}
                      disabled={disabled}
                      onChange={(e) => update(idx, { name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input cell-input--narrow"
                      type="number"
                      min={0}
                      max={99}
                      value={p.arrivalTime}
                      disabled={disabled}
                      onChange={(e) => update(idx, { arrivalTime: clampInt(e.target.value, 0, 99) })}
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input cell-input--narrow"
                      type="number"
                      min={1}
                      max={99}
                      value={p.burstTime}
                      disabled={disabled}
                      onChange={(e) => update(idx, { burstTime: clampInt(e.target.value, 1, 99) })}
                    />
                  </td>
                  <td>
                    <span className="priority-pill" style={{ background: color.pill }}>{p.priority}</span>
                    <input
                      className="cell-input cell-input--narrow"
                      style={{ marginLeft: 6 }}
                      type="number"
                      min={1}
                      max={9}
                      value={p.priority}
                      disabled={disabled}
                      onChange={(e) => update(idx, { priority: clampInt(e.target.value, 1, 9) })}
                    />
                  </td>
                  <td>
                    <input
                      className="cell-input cell-input--narrow"
                      type="number"
                      min={0}
                      max={100}
                      value={p.appetite}
                      disabled={disabled}
                      onChange={(e) => update(idx, { appetite: clampInt(e.target.value, 0, 100) })}
                    />
                  </td>
                  <td className="row-actions">
                    <button
                      className="btn btn--icon btn--danger"
                      onClick={() => remove(idx)}
                      disabled={disabled}
                      aria-label="삭제"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
