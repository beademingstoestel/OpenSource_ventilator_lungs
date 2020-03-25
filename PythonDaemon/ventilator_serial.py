"""
Ventilator Serial Handler
"""
import serial
import queue


class SerialHandler():

    def __init__(self, db_queue, request_queue, out_queue, alarm_queue, port='COM3', baudrate=115200):
        self.ser = serial.Serial(port, baudrate)
        self.ser.reset_input_buffer()
        self.ser.reset_output_buffer()
        self.request_queue = request_queue
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


            if line.startswith('ALARM='):
                # TODO: Handle alarm case
                pass


            # handle measurements
            measurement_types = ['BPM',  # Breaths per minute
                                 'VOL',  # Volume
                                 'TRIG', # Trigger
                                 'PRES'  # Pressure
            ]

            for type in measurement_types:
                if line.startswith((type + '=')):
                    self.queue_put(type, val)

            # handle settings
            settings_types = ['RR',   # Respiratory rate
                              'VT',   # Tidal Volume
                              'PK',   # Peak Pressure
                              'BTS',  # Breath Trigger Threshold
                              'IE',   # Inspiration/Expiration (N for 1/N)
                              'PP',   # PEEP (positive end expiratory pressure)
                              'ADPK', # Allowed deviation Peak Pressure
                              'ADVT', # Allowed deviation Tidal Volume
                              'ADPP', # Allowed deviation PEEP
                              'MODE'  # Machine Mode (Volume Control / Pressure Control)
            ]

            for type in settings_types:
                if line.startswith((type + '=')):
                    self.request_queue.put({'type': 'setting', 'key': type, 'value': val}, False)



