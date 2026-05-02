import type { AlgorithmKey } from "../types";

type AlgorithmSelectorProps = {
  algorithm: AlgorithmKey;
  timeQuantum: number;
  onAlgorithmChange: (algorithm: AlgorithmKey) => void;
  onTimeQuantumChange: (value: number) => void;
};

const algorithmOptions: Array<{ value: AlgorithmKey; label: string }> = [
  { value: "fcfs", label: "FCFS" },
  { value: "rr", label: "RR" },
  { value: "hrrn", label: "HRRN" },
  { value: "spn", label: "SPN" },
  { value: "srtn", label: "SRTN" },
  { value: "diet", label: "DIET" },
];

export default function AlgoristmSelector({
  algorithm,
  timeQuantum,
  onAlgorithmChange,
  onTimeQuantumChange,
}: AlgorithmSelectorProps) {
  return (
    <div className="algorithm-panel">
      <strong>Algorithm</strong>
      <div className="algorithm-options">
        {algorithmOptions.map((option) => (
          <label key={option.value} className="algorithm-option">
            <input
              type="radio"
              name="algorithm"
              checked={algorithm === option.value}
              onChange={() => onAlgorithmChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      <label className="algorithm-quantum">
        <span>Time Quantum</span>
        <input
          type="number"
          min={1}
          value={timeQuantum}
          disabled={algorithm !== "rr"}
          onChange={(event) => onTimeQuantumChange(Math.max(1, Number(event.target.value) || 1))}
        />
      </label>
    </div>
  );
}
