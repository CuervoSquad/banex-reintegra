import os
from rq import Queue, Worker
from redis import Redis

from workers.example_worker import example_task

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")


def enqueue_example(payload=None):
    redis_conn = Redis.from_url(REDIS_URL)
    q = Queue("default", connection=redis_conn)
    return q.enqueue(example_task, payload)


if __name__ == "__main__":
    redis_conn = Redis.from_url(REDIS_URL)
    worker = Worker(["default"], connection=redis_conn)
    worker.work()
