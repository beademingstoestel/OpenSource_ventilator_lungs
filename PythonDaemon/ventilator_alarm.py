import queue
import time



class AlarmHandler():
    def __init__(self, input_queue, serial_queue):
        """
        Alarm Handler constructor

        Args:
            input_queue (queue.Queue): queue on which we receive values
            serial_queue (queue.Queue): queue to notify Controller of alarm
        """
        self.input_queue = input_queue
        self.serial_queue = serial_queue


    def run(self, name):
        print("Starting {}".format(name))
        while True:
            try:
                msg = self.input_queue.get(block=False)
            except queue.Empty:
                msg = None

            if msg != None:
                print("Alarm received: {}".format(msg))

            time.sleep(0) # yield




