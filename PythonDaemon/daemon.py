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
from ventilator_database import DbClient
from ventilator_serial import SerialHandler
from ventilator_websocket import WebsocketHandler
from ventilator_alarm import AlarmHandler


def run():
    """
    Do setup and start threads
    """

    db_queue = queue.Queue() # Queue for values to write to db
    serial_output_queue = queue.Queue() # Queue for messages to send to controller
    alarm_input_queue = queue.Queue() # Queue for values for Alarm thread


    ser_handler = SerialHandler(db_queue, serial_output_queue, alarm_input_queue)
    db_handler = DbClient(db_queue)
    websocket_handler = WebsocketHandler()
    alarm_handler = AlarmHandler(alarm_input_queue,serial_output_queue)

    # Thread that handles bidirectional communication
    ser_thread = threading.Thread(target=ser_handler.run,
                                  daemon=True,
                                  args=('serial thread',))

    # Thread that handles writing measurement values to the db
    db_thread = threading.Thread(target=db_handler.run,
                                 daemon=True,
                                 args=('db thread',))

    # Thread that handles bidirectional websocket communication
    websocket_thread = threading.Thread(target=websocket_handler.run,
                                        daemon=True,
                                        args=('websocket thread',))

    # Thread that checks if an alarm should be raised given current measurements
    alarm_thread = threading.Thread(target=alarm_handler.run,
                                    daemon=True,
                                    args=('alarm thread',))


    ser_thread.start()
    db_thread.start()
    websocket_thread.start()
    alarm_thread.start()


    # Start waiting on Godot
    ser_thread.join()
    db_thread.join()
    websocket_thread.join()
    alarm_thread.join()


if __name__ == "__main__":
    run()
