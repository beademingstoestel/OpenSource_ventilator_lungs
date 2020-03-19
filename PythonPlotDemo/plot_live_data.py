"""
Author : Thibault Thetier
Date : 18/03/2020

Python Script to plot live data coming from a serial connection (arduino for initial purpose)

Some problems of sync which might make the code crash on run, but once started works well

One solution would be to write the data coming from the serial port in a csv file with one script,
and read the csv file and plot the data in another script
"""


from itertools import count
import serial
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

plt.style.use('fivethirtyeight')

index = count()

dataArray = ['0', '0']
x_vals = []
y1_vals = []
y2_vals = []
lines = []

arduinoData = serial.Serial('com3', 115200)

def animate(i):

    arduinoString = arduinoData.readline().decode('utf-8')
    print(arduinoString)
    dataArray = arduinoString.split(',')

    while arduinoData.inWaiting() == 0:  # wait for data
        pass
    x_vals.append(next(index))
    y1_vals.append(float(dataArray[0]))
    y2_vals.append(float(dataArray[1]))

    if next(index) > 40:  # Plot only the last X value, here I chose 40
        x_vals.pop(0)
        y1_vals.pop(0)
        y2_vals.pop(0)

    plt.cla()

    plt.plot(x_vals, y1_vals, label='P')
    plt.plot(x_vals, y2_vals, label='V')

    plt.legend(loc='upper left')
    plt.tight_layout()


ani = FuncAnimation(plt.gcf(), animate, interval=100)

plt.tight_layout()
plt.show()
