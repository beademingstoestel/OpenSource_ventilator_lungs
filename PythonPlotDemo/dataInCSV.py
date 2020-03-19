"""
Author : Thibault Thetier
Date : 18/03/2020

Python Script to write live data coming from a serial port (arduino for initial purpose) in a CSV file

If script crashes on run : sync error, just re-run

"""


import csv
from itertools import count
import serial

arduinoData = serial.Serial('com3', 115200)

fieldnames = ["X", "P", "V", "Tr", "Pset", "Vset", "BPMset", "Trset"]
index = count()


with open('data.csv', 'w') as csv_file:
    csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    csv_writer.writeheader()

while True:

    while arduinoData.inWaiting() == 0:
        pass
    arduinoString = arduinoData.readline().decode("utf-8")
    dataArray = arduinoString.split(',')
    print(arduinoString)

    with open('data.csv', 'a') as csv_file:
        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

        info = {
            "X": next(index),
            "P": dataArray[0],
            "V": dataArray[1],
            "Tr": dataArray[2],
            "Pset": dataArray[3],
            "Vset": dataArray[4],
            "BPMset": dataArray[5],
            "Trset": dataArray[6]
        }

        csv_writer.writerow(info)


    #time.sleep(1)