import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

celery_app = Celery(
    "banex_workers",
    broker=REDIS_URL,
    backend=REDIS_URL.replace("/0", "/1"),
)

celery_app.conf.update(task_track_started=True)
