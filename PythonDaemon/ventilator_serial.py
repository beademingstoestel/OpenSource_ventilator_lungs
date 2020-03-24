"""
Ventilator Serial Handler
"""
import serial


class SerialHandler():

    def __init__(self, db_queue, port='/dev/ttyACM0', baudrate=115200):
        self.ser = serial.Serial(port, baudrate)
        self.queue = db_queue
        self.errorcounter = 0

    def run(self, name):
        print("Starting {}".format(name))
        while True:
            line = self.ser.readline()
            try:
                line = line.decode('utf-8')
            except UnicodeDecodeError:
                print("Failure decoding serial message, continuing")
                if self.errorcounter == 0:
                    self.errorcounter += 1
                    print("utf-8 decode errorcounter: {}".format(self.errorcounter))
                    continue
                else:
                    print("Repeatedly unable to decode serial messages, aborting!")
                    raise SystemExit(-1)
                # TODO: At the start it can happen that we get an incorrect message
                # due to incomplete data. I do a hard abort here to ensure that this only
                # happens once. We need to determine what a tolerable level of failure is here.

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
