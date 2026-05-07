import { PROCESS_COLORS } from "../constants";
import type { ProcessUI } from "../state";
import type { ProcessMetric } from "../pyodide";

export type ProcStatus = "waiting" | "running" | "sleep" | "done";

interface ResultTableProps {
  processes: ProcessUI[];
  metrics: ProcessMetric[];
  statusByPid: Map<string, ProcStatus>;
  energy: number;
  onExpand?: () => void;
  expanded?: boolean;
}

export default function ResultTable({
  processes,
  metrics,
  statusByPid,
  energy,
  onExpand,
  expanded,
}: ResultTableProps) {
  void statusByPid;
  const metricByPid = new Map(metrics.map((m) => [m.pid, m]));

  return (
    <section className={`card result-card ${expanded ? "result-card--expanded" : ""}`}>
      <div className="result-head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span aria-hidden>🐹</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>프로세스 상태 요약</span>
          <span className="energy-badge" title="총 전기 사용량">
            ⚡ {energy.toFixed(1)}
          </span>
        </div>
        {onExpand && (
          <button className="btn" onClick={onExpand}>
            {expanded ? "축소" : "크게 보기"}
          </button>
        )}
      </div>

      <div className="result-table-wrap">
        <table className="result-table">
          <thead>
            <tr>
              <th>PID</th>
              <th>이름</th>
              <th>AT</th>
              <th>BT</th>
              <th>TT</th>
              <th>WT</th>
              <th>NTT</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((p) => {
              const color = PROCESS_COLORS[p.colorIdx % PROCESS_COLORS.length];
              const m = metricByPid.get(p.pid);
              return (
                <tr key={p.pid}>
                  <td><span className="pid-pill" style={{ background: color.pill }}>{p.pid}</span></td>
                  <td>{p.name}</td>
                  <td>{p.arrivalTime}</td>
                  <td>{m ? Math.trunc(m.bt) : "—"}</td>
                  <td>{m ? Math.trunc(m.tt) : "—"}</td>
                  <td>{m ? Math.trunc(m.wt) : "—"}</td>
                  <td>{m ? m.ntt.toFixed(2) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
