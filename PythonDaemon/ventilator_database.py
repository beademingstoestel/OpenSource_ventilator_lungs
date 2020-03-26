"""
Ventilator database connection
"""
import queue
from datetime import datetime
from pymongo import MongoClient


class DbClient():

    def __init__(self, db_queue, addr='mongodb://localhost:27017'):
        self.addr = addr
        self.db = None
        self.queue = db_queue

    def store_pressure(self, pressure_val):
        collection = self.db.pressure_values
        self.__store_value(collection, pressure_val)

    def store_volume(self, volume_val):
        collection = self.db.volume_values
        self.__store_value(collection, volume_val)

    def store_bpm(self, breaths_per_minute_val):
        collection = self.db.breathsperminute_values
        self.__store_value(collection, breaths_per_minute_val)

    def store_trigger(self, trigger_val):
        collection = self.db.trigger_values
        self.__store_value(collection, trigger_val)

    def __store_value(self, collection, val):
        collection.insert_one({'value': val, 'loggedAt': datetime.utcnow()})

    def run(self, name):
        print("Starting {}".format(name))

        # Only start MongoClient after fork()
        client = MongoClient(self.addr)
        self.db = client.beademing
        while True:
            try:
                msg = self.queue.get()
            except queue.Empty:
                continue


            if msg['type'] == 'BPM':
                self.store_bpm(msg['val'])
            elif msg['type'] == 'VOL':
                self.store_volume(msg['val'])
            elif msg['type'] == 'TRIG':
                self.store_trigger(msg['val'])
            elif msg['type'] == 'PRES':
                self.store_pressure(msg['val'])

