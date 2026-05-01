from simulator.algorithm.fcfs import FCFS
from simulator.algorithm.rr import RR
from simulator.algorithm.hrrn import HRRN
from simulator.algorithm.spn import SPN
from simulator.algorithm.srtn import SRTN
from simulator.algorithm.custom import CUSTOM

ALGORITHM_SELECTER = {
    "fcfs": FCFS,
    "rr": RR,
    "hrrn": HRRN,
    "spn": SPN,
    "srtn": SRTN,
    "custom": CUSTOM,
}
