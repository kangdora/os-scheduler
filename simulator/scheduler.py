from simulator.algorithm import ALGORITHM_SELECTER
from simulator.models import Core, Process, ScheduleResult


def schedule(algorithm: str,
             processes: list[Process],
             cores: list[Core],
             time_quantum: int
             ) -> ScheduleResult:
    algo = ALGORITHM_SELECTER[algorithm]()
    if algorithm != "rr":
        return algo.run(processes, cores)

    return algo.run(processes, cores, time_quantum)
