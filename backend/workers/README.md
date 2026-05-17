# Workers (scaffold)

This folder contains a lightweight scaffold for background workers.

Files:

- `example_worker.py`: simple script with `example_task` and a small loop. Run directly for development/testing.

How to run the example worker locally:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m workers.example_worker
```

Next steps:

- If you need a production-ready queue, consider integrating Celery or RQ (see tasks 3 and 4 in the project TODO).
- To persist results, have tasks write to the database via `backend/app/db` helpers or repositories.

Background endpoint (FastAPI)
--------------------------------
An example FastAPI endpoint that uses BackgroundTasks has been added at
`backend/app/api/routes/background_routes.py`.

To test it after starting the API server (e.g. `uvicorn app.main:app --reload`):

```bash
curl -X POST "http://127.0.0.1:8000/background/enqueue" -H "Content-Type: application/json" -d '{"data": {"hello": "world"}}'
```

This will trigger the `example_task` in a background thread.


RQ (Redis Queue)
-----------------
Install requirements (already added to `backend/requirements.txt`): `redis`, `rq`.

To enqueue a job from Python:

```py
from workers.rq_worker import enqueue_example
enqueue_example(payload={"hello": "rq"})
```

To run a worker:

```bash
# with redis running
python -m workers.rq_worker
```


Celery
------
Install requirements (already added to `backend/requirements.txt`): `celery`, `redis`.

To call a task asynchronously:

```py
from workers.celery_tasks import run_example_task
run_example_task.delay({"hello": "celery"})
```

To run a celery worker locally (with redis):

```bash
celery -A workers.celery_app.celery_app worker --loglevel=info
```

Docker compose
--------------
An example `docker-compose.yml` was added at the repo root with services for `postgres`, `redis`, `backend`, and two worker services (`worker_celery` and `worker_rq`). Use it for local development:

```bash
docker compose up --build
```

