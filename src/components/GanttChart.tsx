import { CPU_COLORS, PROCESS_COLORS } from "../constants";
import type { ProcessUI, CoreUI } from "../state";
import type { ExecutionBlock } from "../pyodide";
import Hamster from "./Hamster";

interface GanttChartProps {
  cores: CoreUI[];
  processes: ProcessUI[];
  timeline: ExecutionBlock[];
  currentTick: number;
  maxTime: number;
  onExpand?: () => void;
  expanded?: boolean;
}

export default function GanttChart({
  cores,
  processes,
  timeline,
  currentTick,
  maxTime,
  onExpand,
  expanded,
}: GanttChartProps) {
  const procByPid = new Map(processes.map((p) => [p.pid, p]));
  const ticks = Math.max(maxTime, 1);
  const cellPx = expanded ? 58 : 43;
  const tickGridTemplate = `repeat(${ticks}, ${cellPx}px)`;

  const blocksByCore = new Map<string, ExecutionBlock[]>();
  for (const c of cores) blocksByCore.set(c.coreId, []);
  for (const b of timeline) {
    const arr = blocksByCore.get(b.processor_id);
    if (arr) arr.push(b);
  }

  return (
    <section className="card">
      <div className="card__title card__title--row">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span aria-hidden>🐹</span>
          <span>간트 차트 (Gantt Chart)</span>
        </div>
        {onExpand && (
          <button className="btn" onClick={onExpand}>
            {expanded ? "축소" : "크게 보기"}
          </button>
        )}
      </div>

      <div className="gantt-wrap">
        <div
          className="gantt"
          style={{
            ["--cell" as string]: `${cellPx}px`,
          }}
        >
          <div className="gantt__label">시간</div>
          <div className="gantt__time-row" style={{ gridTemplateColumns: tickGridTemplate }}>
            {Array.from({ length: ticks }).map((_, i) => (
              <span key={i}>{i + 1}</span>
            ))}
          </div>

          {cores.map((c, idx) => {
            const cpuColor = CPU_COLORS[c.colorIdx % CPU_COLORS.length];
            const blocks = blocksByCore.get(c.coreId) ?? [];
            return (
              <div className="gantt__row" key={c.coreId}>
                <div className="gantt__label" style={{ color: cpuColor.pill }}>
                  CPU {idx + 1}
                </div>
                <div
                  className="gantt__track"
                  style={{
                    gridTemplateColumns: tickGridTemplate,
                    backgroundSize: `${cellPx}px 100%`,
                  }}
                >
                  {blocks.map((b, bi) => {
                    if (b.start_time >= currentTick) return null;
                    const visEnd = Math.min(b.end_time, currentTick);
                    const widthTicks = visEnd - b.start_time;
                    if (widthTicks <= 0) return null;
                    const proc = b.pid ? procByPid.get(b.pid) : undefined;
                    if (!proc) return null;
                    const color = PROCESS_COLORS[proc.colorIdx % PROCESS_COLORS.length];
                    const left = b.start_time * cellPx;
                    const width = widthTicks * cellPx;
                    return (
                      <div
                        key={bi}
                        className="gantt__block"
                        style={{
                          left,
                          width,
                          background: color.bg,
                          borderColor: color.border,
                          color: color.pill,
                        }}
                        title={`${proc.pid} ${proc.name} (${b.start_time}-${b.end_time})`}
                      >
                        {width >= 43 && (
                          <Hamster bg={color.bg} border={color.border} size={20} />
                        )}
                        <span>{proc.pid}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
