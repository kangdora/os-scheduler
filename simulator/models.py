from dataclasses import dataclass
from typing import Literal

@dataclass
class Process:
    pid: str
    arrival_time: int
    burst_time: int
    priority: int


@dataclass
class ExecutionBlock:
    processor_id: int
    pid: str | None
    start_time: int
    end_time: int


@dataclass
class Response:
    ok: bool
    data: dict | None
    error: dict | None


@dataclass
class Core:
    core_id: str
    core_type: Literal["P", "E"]


@dataclass
class Request:
    algorithm: Literal["fcfs", "rr", "hrrn", "spn", "srtn", "custom"]
    processes: list[Process | None]
    cores: list[Core]


