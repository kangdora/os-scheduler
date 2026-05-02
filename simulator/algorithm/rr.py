from collections import deque

from simulator.models import Core, ExecutionBlock, Process, ScheduleResult


class RR:
    def __init__(self):
        self.total_energy = 0.0
        self.max_time = 0

    def _init_runtime(self, processes: list[Process], cores: list[Core]):
        ...

    def _has_running_core(self, priority_cores: list[Core], runtime: dict) -> bool:
        ...

    def _move_arrived(self, remain_queue: deque, ready_queue: deque[Process], time: int) -> None:
        ...

    def _assign_to_idle_cores(
        self,
        priority_cores: list[Core],
        runtime: dict,
        ready_queue: deque[Process],
        time: int,
    ) -> None:
        ...

    def _tick_execute(
        self,
        priority_cores: list[Core],
        runtime: dict,
        timeline: list[ExecutionBlock],
        completion_time: dict[str, int],
        time: int,
        time_quantum: int,
    ) -> None:
        print()
        ...

    def _build_result(
        self,
        processes: list[Process],
        timeline: list[ExecutionBlock],
        completion_time: dict[str, int],
    ) -> ScheduleResult:
        ...

    def run(self, processes: list[Process], cores: list[Core], time_quantum: int) -> ScheduleResult:
        ...
