import time
from rq import Queue, Connection, Worker
from redis import Redis

from .example_worker import example_task


def enqueue_example(redis_url: str = "redis://localhost:6379/0", payload=None):
    redis_conn = Redis.from_url(redis_url)
    q = Queue("default", connection=redis_conn)
    job = q.enqueue(example_task, payload)
    return job


if __name__ == "__main__":
    # Start a worker that listens to the 'default' queue
    redis_conn = Redis()
    with Connection(redis_conn):
        worker = Worker(["default"])
        worker.work()
