from .celery_app import celery_app
from .example_worker import example_task


@celery_app.task(name="workers.example_task")
def run_example_task(payload):
    return example_task(payload)
