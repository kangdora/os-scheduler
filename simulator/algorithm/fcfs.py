from simulator.models import Process, ExecutionBlock, Core
from collections import deque


class FCFS:
    name = "fcfs"

    def __init__(self):
        self.total_energy = None
        self.energy_by_core = None

    def run(self, processes: list[Process], cores: list[Core]) -> list[ExecutionBlock]:
        time = 0
        remain_queue = deque(sorted(processes, key=lambda p: (p.arrival_time, p.pid)))
        ready_queue: deque[Process] = deque([])
        timeline: list[ExecutionBlock] = []

        core_state = {
            c["core_id"]: {"proc": None, "remain": 0, "start": 0, "was_active":
                False}
            for c in cores
        }

        self.total_energy = 0.0
        self.energy_by_core = {c["core_id"]: 0.0 for c in cores}

        while ready_queue or remain_queue:
            while remain_queue and remain_queue[0].arrival_time <= time:
                ready_queue.append(remain_queue.popleft())

            if not ready_queue:
                time = remain_queue[0].arrival_time
                continue

            p = ready_queue.popleft()
            start = time
            end = time + p.burst_time
            timeline.append(ExecutionBlock(
                processor_id,
                pid=p.pid,
                start_time=start,
                end_time=end
            ))
            time = end

            # 6) 결과 반환
        return timeline
