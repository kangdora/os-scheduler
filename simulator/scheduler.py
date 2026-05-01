from simulator.algorithm import ALGORITHM_SELECTER
from simulator.models import Core, ExecutionBlock, Process


def schedule(algorithm: str,
             processes: list[Process],
             cores: list[Core],
             time_quantum: int
             ) -> list[ExecutionBlock]:
    algo = ALGORITHM_SELECTER[algorithm]()
    if algorithm != "rr":
        return algo.run(processes, cores)

    return algo.run(processes, cores, time_quantum)
