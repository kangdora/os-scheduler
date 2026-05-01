from collections import deque

from simulator.core_spec import CORE_SPECS
from simulator.models import Core, ExecutionBlock, Process, ProcessMetric, ScheduleResult


class FCFS:
    name = "fcfs"

    def __init__(self):
        # 전체 시뮬레이션 누적 에너지
        self.total_energy = 0.0
        # 전체 작업 완료 시각(총 소요 시간)
        self.max_time = 0

    def _init_runtime(self, processes: list[Process], cores: list[Core]):
        remain_queue = deque(sorted(processes, key=lambda p: (p.arrival_time, p.pid)))
        ready_queue: deque[Process] = deque([])
        timeline: list[ExecutionBlock] = []
        completion_time: dict[str, int] = {}
        priority_cores = sorted(cores, key=lambda c: 0 if c.core_type == "P" else 1)
        runtime = {
            c.core_id: {"proc": None, "remain": 0, "start": 0, "was_active": False}
            for c in priority_cores
        }
        return remain_queue, ready_queue, timeline, completion_time, priority_cores, runtime

    def _has_running_core(self, priority_cores: list[Core], runtime: dict) -> bool:
        for c in priority_cores:
            if runtime[c.core_id]["proc"] is not None:
                return True
        return False

    def _move_arrived(self, remain_queue: deque, ready_queue: deque[Process], time: int) -> None:
        while remain_queue and remain_queue[0].arrival_time <= time:
            ready_queue.append(remain_queue.popleft())

    def _assign_to_idle_cores(
        self,
        priority_cores: list[Core],
        runtime: dict,
        ready_queue: deque[Process],
        time: int,
    ) -> None:
        for c in priority_cores:
            st = runtime[c.core_id]
            if st["proc"] is None and ready_queue:
                p = ready_queue.popleft()
                st["proc"] = p
                st["remain"] = p.burst_time
                st["start"] = time

    def _tick_execute(
        self,
        priority_cores: list[Core],
        runtime: dict,
        timeline: list[ExecutionBlock],
        completion_time: dict[str, int],
        time: int,
    ) -> None:
        for c in priority_cores:
            st = runtime[c.core_id]
            p = st["proc"]
            if p is None:
                st["was_active"] = False
                continue

            spec = CORE_SPECS[c.core_type]
            tick_energy = spec["run_power"]
            if not st["was_active"]:
                tick_energy += spec["startup_power"]
            self.total_energy += tick_energy

            st["remain"] -= min(spec["speed"], st["remain"])
            st["was_active"] = True

            if st["remain"] == 0:
                finished_at = time + 1
                timeline.append(
                    ExecutionBlock(
                        processor_id=int(c.core_id),
                        pid=p.pid,
                        start_time=st["start"],
                        end_time=finished_at,
                    )
                )
                completion_time[p.pid] = finished_at
                st["proc"] = None
                st["was_active"] = False

    def _build_result(
        self,
        processes: list[Process],
        timeline: list[ExecutionBlock],
        completion_time: dict[str, int],
    ) -> ScheduleResult:
        process_metrics: list[ProcessMetric] = []
        total_wt = 0.0
        total_ntt = 0.0
        for p in sorted(processes, key=lambda x: x.pid):
            at = p.arrival_time
            tat = completion_time[p.pid] - at
            wt = tat - p.burst_time
            ntt = tat / p.burst_time
            total_wt += wt
            total_ntt += ntt
            process_metrics.append(ProcessMetric(pid=p.pid, at=at, wt=wt, ntt=ntt))

        process_count = len(processes)
        avg_wt = total_wt / process_count if process_count else 0.0
        avg_ntt = total_ntt / process_count if process_count else 0.0

        return ScheduleResult(
            timeline=timeline,
            process_metrics=process_metrics,
            avg_wt=avg_wt,
            avg_ntt=avg_ntt,
            total_energy=self.total_energy,
            max_time=self.max_time,
        )

    def run(self, processes: list[Process], cores: list[Core]) -> ScheduleResult:
        (
            remain_queue,
            ready_queue,
            timeline,
            completion_time,
            priority_cores,
            runtime,
        ) = self._init_runtime(processes, cores)

        time = 0
        self.total_energy = 0.0

        while True:
            has_running_core = self._has_running_core(priority_cores, runtime)
            if not (remain_queue or ready_queue or has_running_core):
                break

            self._move_arrived(remain_queue, ready_queue, time)
            self._assign_to_idle_cores(priority_cores, runtime, ready_queue, time)
            self._tick_execute(priority_cores, runtime, timeline, completion_time, time)
            time += 1

        self.max_time = time
        return self._build_result(processes, timeline, completion_time)
