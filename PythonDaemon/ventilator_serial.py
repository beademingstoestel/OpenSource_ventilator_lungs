"""
Ventilator Serial Handler
"""
import serial


class SerialHandler():

    def __init__(self, db_queue, port='/dev/ttyACM0', baudrate=115200):
        self.ser = serial.Serial(port, baudrate)
        self.queue = db_queue

    def run(self, name):
        print("Starting {}".format(name))
        while True:
            line = self.ser.readline()
            line = line.decode('utf-8')
            tokens = line.split('=', 1)
            val = tokens[-1].rstrip('\r\n')
            if line.startswith(('bpm=')):
                self.queue.put({'type': 'BPM', 'val': val})
            elif line.startswith(('Vol=')):
                self.queue.put({'type': 'VOL', 'val': val})
            elif line.startswith(('Trig=')):
                self.queue.put({'type': 'TRIG', 'val': val})
            elif line.startswith(('Pres=')):
                self.queue.put({'type': 'PRES', 'val': val})
