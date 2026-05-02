from dataclasses import asdict, is_dataclass
import json

def to_jsonable(value):
    if is_dataclass(value):
        return asdict(value)

    if isinstance(value, list):
        return [to_jsonable(v) for v in value]

    if isinstance(value, dict):
        return {k: to_jsonable(v) for k, v in value.items()}

    return value


def to_json(value):
    return json.dumps(to_jsonable(value), ensure_ascii=False)