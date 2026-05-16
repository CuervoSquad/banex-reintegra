import time
from typing import Any


def example_task(data: Any) -> str:
    """Example task that simulates processing."""
    # Simulate work
    time.sleep(1)
    result = f"processed: {data}"
    # Here you would persist results to DB, push to queue, etc.
    return result


if __name__ == "__main__":
    print("Running example worker loop (ctrl+C to stop)")
    try:
        i = 0
        while True:
            payload = {"id": i, "value": f"test-{i}"}
            out = example_task(payload)
            print(out)
            i += 1
            time.sleep(2)
    except KeyboardInterrupt:
        print("Worker stopped")
