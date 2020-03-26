import queue
import time


class AlarmHandler():


    def __init__(self, input_queue, serial_queue, request_queue):
        """
        Alarm Handler constructor

        Args:
            input_queue (queue.Queue): queue on which we receive values
            serial_queue (queue.Queue): queue to notify Controller of alarm
        """
        self.input_queue = input_queue
        self.serial_queue = serial_queue
        self.request_queue = request_queue

        self.alarm_val = 0;

        self.time_last_kick_sent = 0
        self.time_last_kick_received = 0

        self.time_watchdog_kick_checked = 0


    def run(self, name):
        print("Starting {}".format(name))
        while True:

            cur_time = time.time()
            # Do we need to kick the watchdog?
            if ((cur_time - self.time_last_kick_sent) > 1 ):
                self.serial_queue.put({'type': 'ALARM', 'val': self.alarm_val})
                self.time_last_kick_sent = cur_time

            try:
                msg = self.input_queue.get(block=False)
            except queue.Empty:
                msg = None

            if msg != None:
                if msg['type'] == "ALARM":
                    self.time_last_kick_received == cur_time
                    if msg['val'] != 0:
                        self.request_queue({'type': 'error', 'value': msg['val']})

            # Have we received a watchdog kick in time?
            if ((cur_time - self.time_watchdog_kick_checked) > 3):
                self.time_watchdog_kick_checked = cur_time
                # Send a watchdog error to the UI every 3 seconds if we lose connection
                if(cur_time - self.time_last_kick_received > 3):
                    self.request_queue.put({'type': 'error', 'value': 4}) # Error 4: connection timeout

            time.sleep(0.2)



