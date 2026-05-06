import { ALGORITHMS, type AlgorithmId } from "../constants";

export type SimState = "idle" | "running" | "paused" | "finished";

interface AlgorithmPanelProps {
  algorithm: AlgorithmId;
  setAlgorithm: (id: AlgorithmId) => void;
  timeQuantum: number;
  setTimeQuantum: (n: number) => void;
  interval: number;
  setInterval: (n: number) => void;
  simState: SimState;
  loading: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export default function AlgorithmPanel(props: AlgorithmPanelProps) {
  const {
    algorithm, setAlgorithm,
    timeQuantum, setTimeQuantum,
    interval, setInterval,
    simState, loading,
    onStart, onPause, onResume, onReset,
  } = props;

  const tqDisabled = algorithm !== "rr" || simState === "running";
  const editsDisabled = simState === "running";

  return (
    <section className="algo-panel">
      <div className="card__title">
        <span aria-hidden>🐹</span>
        <span>알고리즘 선택</span>
      </div>

      <label className="algo-panel__field">
        알고리즘 선택
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as AlgorithmId)}
          disabled={editsDisabled}
        >
          {ALGORITHMS.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
      </label>

      <label className="algo-panel__field">
        Time Quantum
        <input
          type="number"
          min={1}
          max={99}
          value={timeQuantum}
          disabled={tqDisabled}
          onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value || "1", 10)))}
        />
      </label>

      <label className="algo-panel__field">
        Interval (ms)
        <input
          type="number"
          min={50}
          max={5000}
          step={50}
          value={interval}
          disabled={editsDisabled}
          onChange={(e) => setInterval(Math.max(50, parseInt(e.target.value || "500", 10)))}
        />
      </label>

      <div className="algo-panel__buttons">
        {simState === "idle" || simState === "finished" ? (
          <button className="btn btn--primary btn--big" onClick={onStart} disabled={loading}>
            {loading ? "햄스터 깨우는 중..." : "▶ 스케줄링 시작"}
          </button>
        ) : simState === "running" ? (
          <button className="btn btn--big" onClick={onPause}>⏸ 일시정지</button>
        ) : (
          <>
            <button className="btn btn--primary btn--big" onClick={onResume}>▶ 재생</button>
            <button className="btn btn--danger btn--big" onClick={onReset}>↺ 초기화</button>
          </>
        )}
      </div>
    </section>
  );
}
