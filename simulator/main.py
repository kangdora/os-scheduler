from simulator.models import Process, DietProcess, Core, Request, DietRequest, Response
from simulator.scheduler import schedule


class SimulatorApp:
    def parse_request(self, request_json: dict) -> Request | DietRequest:
        # DIET는 프론트에서 받은 appetite를 프로세스 내장 값으로 써야 하므로 별도 모델로 파싱
        if request_json["algorithm"] == "diet":
            processes = [
                DietProcess(
                    pid=p["pid"],
                    arrival_time=p["arrival_time"],
                    burst_time=p["burst_time"],
                    appetite=p["appetite"],
                )
                for p in request_json["processes"]
            ]
        else:
            processes = [
                Process(
                    pid=p["pid"],
                    arrival_time=p["arrival_time"],
                    burst_time=p["burst_time"]
                )
                for p in request_json["processes"]
            ]

        # 코어 입력은 모든 알고리즘이 같은 모델을 공유한다.
        cores = [
            Core(
                core_id=c["core_id"],
                core_type=c["core_type"]
            )
            for c in request_json["cores"]
        ]

        if request_json["algorithm"] == "diet":
            # DietRequest는 processes 타입을 DietProcess로 고정함.
            return DietRequest(
                algorithm=request_json["algorithm"],
                processes=processes,
                cores=cores,
                time_quantum=request_json["time_quantum"]
            )

        # 일반 스케줄러 요청은 기존 Process로 사용
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

            result = schedule(
                algorithm=req.algorithm,
                processes=req.processes,
                cores=req.cores,
                time_quantum=time_quantum,
            )

            return Response(ok=True, data=result, error=None)

        except Exception as e:
            return Response(ok=False, data=None, error={"message": str(e)})


app = SimulatorApp()
