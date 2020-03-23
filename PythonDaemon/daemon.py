#!/usr/bin/python3
"""
Ventilator daemon

This daemon has a number of tasks
 1. Get data from serial output and store it in the database
 2. Get alarm setpoints from the UI and sound an alarm when the
    patient needs attention
 3. Ensure the Arduino is still running
"""
import threading
import queue
import time
from ventilator_database import DbClient
from ventilator_serial import SerialHandler


def run():
    """
    Do setup and start threads
    """
    db_queue = queue.Queue()

    ser_handler = SerialHandler(db_queue)
    db_handler = DbClient(db_queue)

    ser_thread = threading.Thread(target=ser_handler.run,
                                  daemon=True,
                                  args=('serial thread',))
    db_thread = threading.Thread(target=db_handler.run,
                                 daemon=True,
                                 args=('db thread',))

    ser_thread.start()
    db_thread.start()

    # Start waiting on Godot
    ser_thread.join()
    db_thread.join()



if __name__ == "__main__":
    run()
