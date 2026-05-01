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

    def run(self, processes: list[Process], cores: list[Core]) -> ScheduleResult:
        # 아직 도착하지 않은 프로세스 큐
        # FCFS 기준: arrival_time -> pid 순으로 1회 정렬
        remain_queue = deque(sorted(processes, key=lambda p: (p.arrival_time, p.pid)))

        # 실행 대기 중인 큐
        ready_queue: deque[Process] = deque([])

        # 최종 실행 타임라인(간트 차트 데이터)
        timeline: list[ExecutionBlock] = []
        completion_time: dict[str, int] = {}

        # 현재 시뮬레이션 시각 (1초 tick)
        time = 0

        # 같은 시각에 코어 할당 시 P 코어를 먼저 사용
        priority_cores = sorted(cores, key=lambda c: 0 if c.core_type == "P" else 1)

        # 코어별 런타임 상태
        # proc: 현재 실행 프로세스
        # remain: 남은 일 양
        # start: 해당 프로세스 시작 시각
        # was_active: 직전 tick 활성 여부 (시동 전력 계산용)
        runtime = {
            c.core_id: {"proc": None, "remain": 0, "start": 0, "was_active": False}
            for c in priority_cores
        }

        # run() 호출마다 초기화
        self.total_energy = 0.0

        # 종료 조건:
        # 1) 미래 도착 작업 없음
        # 2) 준비 큐 비어 있음
        # 3) 현재 실행 작업 없음
        while True:
            has_running_core = False
            for c in priority_cores:
                if runtime[c.core_id]["proc"] is not None:
                    has_running_core = True
                    break
            if not (remain_queue or ready_queue or has_running_core):
                break

            # 1) 현재 시각까지 도착한 프로세스를 준비 큐로 이동
            while remain_queue and remain_queue[0].arrival_time <= time:
                ready_queue.append(remain_queue.popleft())

            # 2) 비어 있는 코어에 FCFS 순서대로 할당 (P 코어 우선)
            for c in priority_cores:
                st = runtime[c.core_id]
                if st["proc"] is None and ready_queue:
                    p = ready_queue.popleft()
                    st["proc"] = p
                    st["remain"] = p.burst_time
                    st["start"] = time

            # 3) 각 코어 1초 실행
            for c in priority_cores:
                st = runtime[c.core_id]
                p = st["proc"]

                # 코어가 idle이면 비활성 상태로 표시 후 스킵
                if p is None:
                    st["was_active"] = False
                    continue

                # 코어 타입(E/P)에 따른 스펙 조회
                spec = CORE_SPECS[c.core_type]

                # 동작 전력은 실행 중이면 항상 소모
                tick_energy = spec["run_power"]

                # 직전 tick idle -> 이번 tick active 인 경우 시동 전력 추가
                if not st["was_active"]:
                    tick_energy += spec["startup_power"]
                self.total_energy += tick_energy

                # 1초 동안 처리 가능한 양만큼 남은 일 감소
                st["remain"] -= min(spec["speed"], st["remain"])
                st["was_active"] = True

                # 이번 tick 종료 시 작업이 끝나면 timeline 기록
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

            # 다음 tick으로 이동
            time += 1

        # 전체 작업 완료 시각 기록
        self.max_time = time

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
