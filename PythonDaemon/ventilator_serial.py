"""
Ventilator Serial Handler
"""
import serial
import queue


class SerialHandler():

    def __init__(self, db_queue, out_queue, alarm_queue, port='/dev/ttyACM0', baudrate=115200):
        self.ser = serial.Serial(port, baudrate)
        self.ser.reset_input_buffer()
        self.ser.reset_output_buffer()
        self.db_queue = db_queue # Enqueue to
        self.out_queue = out_queue
        self.alarm_queue = alarm_queue
        self.errorcounter = 0

    def queue_put(self, type, val):
        """
        Send values to all necessary queues

        Args:
            type (str): type to be sent
            val (int): value to be sent
        """
        self.db_queue.put({'type': type, 'val': val})
        self.alarm_queue.put({'type': type, 'val': val})



    def run(self, name):
        print("Starting {}".format(name))
        while True:
            try:
                msg = self.out_queue.get(block=False)
            except queue.Empty:
                msg = None

            if msg != None:
                print(bytes(msg['val'], 'utf-8'))
                self.ser.write(msg['val'].encode())


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
            if line.startswith(('BPM=')):
                self.queue_put('BPM', val)
            elif line.startswith(('VOL=')):
                self.queue_put('VOL', val)
            elif line.startswith(('TRIG=')):
                self.queue_put('TRIG', val)
            elif line.startswith(('PRES=')):
                self.queue_put('PRES', val)
