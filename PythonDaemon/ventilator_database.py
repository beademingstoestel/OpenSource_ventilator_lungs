"""
Ventilator database connection
"""
from datetime import datetime
from pymongo import MongoClient


class DbClient():

    def __init__(self, db_queue, addr='mongodb://localhost:27017'):
        client = MongoClient(addr)
        self.db = client.beademing
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
        collection.insert_one({'value': val, 'loggedAt': datetime.now()})

    def run(self, name):
        print("Starting {}".format(name))

        while True:
            msg = self.queue.get()

            if msg['type'] is 'BPM':
                self.store_bpm(msg['val'])
            elif msg['type'] is 'VOL':
                self.store_volume(msg['val'])
            elif msg['type'] is 'TRIG':
                self.store_trigger(msg['val'])
            elif msg['type'] is 'PRES':
                self.store_pressure(msg['val'])
