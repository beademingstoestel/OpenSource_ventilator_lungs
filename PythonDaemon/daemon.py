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
import multiprocessing as mp
from ventilator_database import DbClient
from ventilator_serial import SerialHandler
from ventilator_websocket import WebsocketHandler
from ventilator_alarm import AlarmHandler

from ventilator_request import APIRequest
from ventilator_request_handler import RequestHandler
from datetime import datetime


def run():
    """
    Do setup and start threads
    """

    api_request = APIRequest("http://localhost:3001")
    api_request.send_setting("startPythonDaemon", datetime.utcnow())

    db_queue = mp.Queue() # Queue for values to write to db
    serial_output_queue = mp.Queue() # Queue for messages to send to controller
    alarm_input_queue = mp.Queue() # Queue for values for Alarm thread
    request_queue = mp.Queue() # Queue with the requests to be sent to the API

    ser_handler = SerialHandler(db_queue, request_queue, serial_output_queue, alarm_input_queue)
    db_handler = DbClient(db_queue)
    # websocket_handler = WebsocketHandler()
    alarm_handler = AlarmHandler(alarm_input_queue,serial_output_queue)
    request_handler = RequestHandler(api_request, request_queue)

    # Thread that handles bidirectional communication
    ser_thread = mp.Process(target=ser_handler.run,
                                  daemon=True,
                                  args=('serial thread',))

    # Thread that handles writing measurement values to the db
    db_thread = mp.Process(target=db_handler.run,
                                 daemon=True,
                                 args=('db thread',))

    # Thread that handles bidirectional websocket communication
    # websocket_thread = mp.Process(target=websocket_handler.run,
    #                                    daemon=True,
    #                                    args=('websocket thread',))

    # Thread that checks if an alarm should be raised given current measurements
    alarm_thread = mp.Process(target=alarm_handler.run,
                                    daemon=True,
                                    args=('alarm thread',))

    # Thread that sends the received values to the API
    request_thread = mp.Process(target=request_handler.run,
                                    daemon=True,
                                    args=('request thread',))


    ser_thread.start()
    db_thread.start()
    # websocket_thread.start()
    alarm_thread.start()
    request_thread.start()


    # Start waiting on Godot
    ser_thread.join()
    db_thread.join()
    # websocket_thread.join()
    alarm_thread.join()
    request_thread.join()


if __name__ == "__main__":
    run()
