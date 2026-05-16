from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel

from ...workers.example_worker import example_task

router = APIRouter(prefix="/background", tags=["background"])


class Payload(BaseModel):
    data: dict


def run_and_log(payload: dict):
    # call the example task (synchronous) from the background thread
    result = example_task(payload)
    # Here you could save result to DB or log it
    print("Background result:", result)


@router.post("/enqueue")
def enqueue(payload: Payload, background_tasks: BackgroundTasks):
    """Endpoint that enqueues a background task using FastAPI's BackgroundTasks."""
    background_tasks.add_task(run_and_log, payload.data)
    return {"status": "queued"}
