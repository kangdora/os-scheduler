from simulator.algorithm import ALGORITHM_SELECTER
from simulator.models import Core, Process, ScheduleResult


def schedule(algorithm: str,
             processes: list[Process],
             cores: list[Core],
             time_quantum: int
             ) -> ScheduleResult:
    # DietProcess는 Process의 하위 타입이므로 스케줄러 호출 형태는 기존 Process 리스트처럼 유지한다.
    algo = ALGORITHM_SELECTER[algorithm]()
    if algorithm != "rr":
        return algo.run(processes, cores)

    return algo.run(processes, cores, time_quantum)
