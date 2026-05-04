from dataclasses import dataclass
from typing import Literal

@dataclass
class Process:
    pid: str
    arrival_time: int
    burst_time: int


@dataclass
class ExecutionBlock:
    processor_id: str
    pid: str | None
    start_time: int
    end_time: int


@dataclass
class ProcessMetric:
    pid: str
    bt: float
    at: int
    tt: float
    wt: float
    ntt: float


@dataclass
class ScheduleResult:
    timeline: list[ExecutionBlock]
    process_metrics: list[ProcessMetric]
    avg_wt: float
    avg_ntt: float
    total_energy: float
    max_time: int


@dataclass
class Response:
    ok: bool
    data: dict | ScheduleResult | None
    error: dict | None


@dataclass
class Core:
    core_id: str
    core_type: Literal["P", "E"]


@dataclass
class Request:
    algorithm: Literal["fcfs", "rr", "hrrn", "spn", "srtn", "diet"]
    processes: list[Process]
    time_quantum: int | None
    cores: list[Core]


@dataclass
class ProcessorRuntime:
    current_process: Process | None
    remaining_work: int
    start_time: int
    was_active_last_tick: bool
    elapsed_time: int


