from collections import deque

from simulator.models import Core, ExecutionBlock, Process, ScheduleResult

"""프로세스 burst를 알아야 함. 선점임. 프로세스가 새로 들어왔을 때 비교하여 더 작은 것 실행(이미 작은 게 있다면 그거랑만 비교)."""
class SRTN:
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
    ) -> None:
        ...

    def _build_result(
        self,
        processes: list[Process],
        timeline: list[ExecutionBlock],
        completion_time: dict[str, int],
    ) -> ScheduleResult:
        ...

    def run(self, processes: list[Process], cores: list[Core]) -> ScheduleResult:
        ...
