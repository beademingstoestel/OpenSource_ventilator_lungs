"""
Author : Thibault Thetier
Date : 20/03/2020

Python Script to plot live data coming from serial port

"""

import serial
import numpy
from matplotlib.pylab import *
from mpl_toolkits.axes_grid1 import host_subplot
import matplotlib.animation as animation
import time
import struct

# Sent for figure
font = {'size': 9}
matplotlib.rc('font', **font)

arduinoData = serial.Serial('com3', 115200)

# Setup figure and subplots
f0 = figure(num=0, figsize=(12, 8))  # , dpi = 100)
f0.suptitle("Respirator Monitoring", fontsize=12)
ax01 = subplot2grid((2, 2), (0, 0))
ax02 = subplot2grid((2, 2), (0, 1))
ax03 = subplot2grid((2, 2), (1, 0), colspan=2, rowspan=1)
ax04 = ax03.twinx()
# tight_layout()

# Set titles of subplots
ax01.set_title('Parameters')
ax02.set_title('Breath (Inspiration or Expiration)')
ax03.set_title('Inspiratory pressure and Volume Tidal vs Time')

# Data Update
xmax = 50.0  # time span of x-axis (in seconds)
x = 0.0

# Data Placeholders
peep = []  # Positive End Expiratory Pressure (cmH2O)
vt = []  # Volume Tidal (ml)
rr = []  # Respiratory rhythm (number/m)
ip = []  # Inspiratory Pressure (cmH2O)
br = []  # Breath (Inspiration or Expiration)
t = []  # Time (s)
trigger = 0

timeBetweenBreaths = 0
cumulatedTime = 0


# set y-limits
ax01.set_ylim(0, 10)
ax02.set_ylim(-1, 2)
ax03.set_ylim(-2, 2)
ax04.set_ylim(-2, 2)

# sex x-limits
ax01.set_xlim(0, 10)
ax02.set_xlim(0, xmax)
ax03.set_xlim(0, xmax)
ax04.set_xlim(0, xmax)

# turn on grids
ax02.grid(True)
ax03.grid(True)

# turn off axis
ax01.axis('off')

# set label names
ax02.set_xlabel("t (in seconds)")
#ax02.set_ylabel("Breath (Inspiration/Expiration)")
ax03.set_xlabel("t")
ax03.set_ylabel("Inspiratory Pressure (cmH2O)")
ax04.set_ylabel("Volume Tidal (ml)")

# set line plots
pBreath, = ax02.plot(t, vt, 'b-')

pIP, = ax03.plot(t, ip, 'b-', label="Inspiratory Pressure")
pVT, = ax04.plot(t, vt, 'g-', label="Volume Tidal")

# set texts for displaying calues
peepTxt = ax01.text(1, 8, 'PEEP = ', fontsize=12)
vtTxt = ax01.text(1, 7, 'VT = ', fontsize=12)
rrTxt = ax01.text(1, 6, 'Respiratory Rythm = ', fontsize=12)
ipTxt = ax01.text(1, 4, 'Inspiratory Pressure = ', fontsize=12)
tBBTxt = ax01.text(1, 3, 'Time Between Breaths = ', fontsize=12)


# set legends
#ax02.legend([pBreath], [pBreath.get_label()])
ax03.legend([pIP, pVT], [pIP.get_label(), pVT.get_label()])


'''is_connected = False
# Initialize communication with Arduino
while not is_connected:
    print("Waiting for arduino...")
    arduinoData.write(struct.pack('<i', 1))
    #answer = int(arduinoData.read(1).decode('utf-8'))
    answer = struct.unpack('<b', bytearray(arduinoData.read(1)))[0]
    print(answer)
    if not (answer == 1 or answer == 2):
        time.sleep(2)
        continue
    else:
        is_connected = True

print("Connected to Arduino")'''



def updateData(self):
    global x
    global peep
    global vt
    global rr
    global ip
    global trigger
    global timestamp
    global timeBetweenBreaths
    global t
    global start_time
    global cumulatedTime

    #arduinoData.write(struct.pack('<i', 1))

    arduinoString = arduinoData.readline().decode('utf-8')
    print(arduinoString)
    dataArray = arduinoString.split(',')

    while arduinoData.inWaiting() == 0:  # wait for data
        pass

    ipValue = float(dataArray[0])
    vtValue = float(dataArray[1])
    rrValue = float(dataArray[2])
    peepValue = float(dataArray[3])
    brValue = float(dataArray[4])

    if trigger == brValue:
        pass
    else:
        timeBetweenBreaths = round(cumulatedTime - timestamp, 2)
        timestamp = cumulatedTime
        trigger = brValue
        #print(trigger)

    ip.append(ipValue)
    vt.append(vtValue)
    rr.append(rrValue)
    peep.append(peepValue)
    br.append(brValue)
    t.append(cumulatedTime)

    x += 0.04
    cumulatedTime += round(time.time() - start_time, 2)
    start_time = round(time.time(), 2)
    #print('x = ' + str(x) + ' time = ' + str(round(cumulatedTime, 2)) + ' diff = ' + str(round(cumulatedTime - x, 2)))

    pBreath.set_data(t, br)

    pIP.set_data(t, ip)
    pVT.set_data(t, vt)

    # update texts showing variable values
    peepTxt.set_text('PEEP value = ' + str(peepValue) + 'cmH2O')
    vtTxt.set_text('VT = ' + str(vtValue) + 'ml')
    rrTxt.set_text('Respiratory Rythm = ' + str(rrValue) + ' resp/min')
    ipTxt.set_text('Inspiratory Pressure = ' + str(ipValue) + 'cmH2O')
    tBBTxt.set_text('Time Between Breaths = ' + str(timeBetweenBreaths) + 's')


    # update x-axis to show only last elements, time span defined by xmax
    if cumulatedTime >= xmax - 1.00:
        pBreath.axes.set_xlim(cumulatedTime - xmax + 2, cumulatedTime)
        pIP.axes.set_xlim(cumulatedTime - xmax + 2, cumulatedTime)
        pVT.axes.set_xlim(cumulatedTime - xmax + 2, cumulatedTime)

        # delete first element of lists to free memory
        ip.pop(0)
        vt.pop(0)
        rr.pop(0)
        peep.pop(0)
        t.pop(0)
    return pVT, pIP, pBreath


start_time = round(time.time(), 2)
timestamp = start_time
# interval: draw new frame every 'interval' ms
simulation = animation.FuncAnimation(f0, updateData, interval=40)


plt.show()
