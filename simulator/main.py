from simulator.models import Process, Core, Request, Response
from simulator.scheduler import schedule


class SimulatorApp:
    def parse_request(self, request_json: dict) -> Request:
        processes = [
            Process(
                pid=p["pid"],
                arrival_time=p["arrival_time"],
                burst_time=p["burst_time"],
                priority=p["priority"]
            )

            for p in request_json["precesses"]
        ]

        cores = [
            Core(
                core_id=c["core_id"],
                core_type=c["core_type"]
            )
            for c in request_json["cores"]
        ]

        return Request(
            algorithm=request_json["algorithm"],
            processes=processes,
            cores=cores,
            time_quantum=request_json["time_quantum"]
        )

    def run(self, request_json: dict) -> Response:
        try:
            req = self.parse_request(request_json)
            time_quantum = request_json.get("time_quantum", 1)

            timeline = schedule(
                algorithm=req.algorithm,
                processes=req.processes,
                cores=req.cores,
                time_quantum=time_quantum,
            )

            return Response(ok=True, data={"timeline": timeline}, error=None)

        except Exception as e:
            return Response(ok=False, data=None, error={"message": str(e)})


app = SimulatorApp()
