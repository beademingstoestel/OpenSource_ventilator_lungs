"""
Author : Thibault Thetier
Date : 18/03/2020

Python Script to plot live data coming from CSV file

"""

from matplotlib.pylab import *
from mpl_toolkits.axes_grid1 import host_subplot
import matplotlib.animation as animation
from itertools import count
import pandas as pd


# Sent for figure
font = {'size'   : 9}
matplotlib.rc('font', **font)

# Setup figure and subplots
f0 = figure(num = 0, figsize = (12, 8))#, dpi = 100)
f0.suptitle("Respirator Monitoring", fontsize=12)
ax01 = subplot2grid((2, 2), (0, 0))
ax02 = subplot2grid((2, 2), (0, 1))
ax03 = subplot2grid((2, 2), (1, 0), colspan=2, rowspan=1)
ax04 = ax03.twinx()
#tight_layout()

# Set titles of subplots
ax01.set_title('Variable Values')
ax02.set_title('Volume Value')
ax03.set_title('Pressure and Volume vs Time')

# set y-limits
ax01.set_xlim(0, 10)
ax01.set_ylim(0, 10)
ax02.set_ylim(0, 6000)
ax03.set_ylim(0, 2500)
ax04.set_ylim(0, 6000)

# Turn on grids
#ax01.grid(True)
ax02.grid(True)
ax03.grid(True)

# set label names
ax02.set_ylabel("V")
ax03.set_ylabel("P")
ax04.set_ylabel("V")

index = count()
data = pd.read_csv('data.csv').tail(50)  # We take only the last n rows of the file, number to be decided
x = data['X']
p = data['P']
v = data['V']
tr = data['Tr']
pSet = data['Pset']
vSet = data['Vset']
bpmSet = data['BPMset']
trSet = data['Trset']

pTxt = ax01.text(1, 8, 'P value = ', fontsize=12)
vTxt = ax01.text(1, 7, 'V value = ', fontsize=12)
TrTxt = ax01.text(1, 6, 'Trigger value = ', fontsize=12)
pSetTxt = ax01.text(1, 4, 'Pset value = ', fontsize=12)
vSetTxt = ax01.text(1, 3, 'Vset value = ', fontsize=12)
BPMSetTxt = ax01.text(1, 2, 'BPMSet value = ', fontsize=12)
TrSetTxt = ax01.text(1, 1, 'TriggerSet value = ', fontsize=12)


vl, = ax02.plot(x, v, 'r-', label='V')
p2, = ax03.plot(x, p, 'b-', label='P')
v2, = ax04.plot(x, v, 'r-', label='V')


def updateData(self):

	data = pd.read_csv('data.csv').tail(50)  # We take only the last n rows of the file, number to be decided
	x = data['X']
	p = data['P']
	v = data['V']
	tr = data['Tr']
	pSet = data['Pset']
	vSet = data['Vset']
	bpmSet = data['BPMset']
	trSet = data['Trset']

	#ax01.set_xlim(x.iloc[x.size - 40 - 1], x.iloc[x.size - 1])
	ax02.set_xlim(x.iloc[x.size - 40 - 1], x.iloc[x.size - 1])
	ax03.set_xlim(x.iloc[x.size - 40 - 1], x.iloc[x.size - 1])

	#p1.set_data(x, y1)
	vl.set_data(x, v)
	p2.set_data(x, p)
	v2.set_data(x, v)
	#plt.plot(x, y3 * 1500, label='Trigger')  # Trigger is 0 or 1, just plotting something visible if triggered

	pTxt.set_text('P value = ' + str(p.iloc[p.size - 1]))
	vTxt.set_text('V value = ' + str(v.iloc[v.size - 1]))
	TrTxt.set_text('Trigger value = ' + str(tr.iloc[tr.size - 1]))
	pSetTxt.set_text('Pset value = ' + str(pSet.iloc[pSet.size - 1]))
	vSetTxt.set_text('Vset value = ' + str(vSet.iloc[vSet.size - 1]))
	BPMSetTxt.set_text('BPMSet value = ' + str(bpmSet.iloc[bpmSet.size - 1]))
	TrSetTxt.set_text('TriggerSet value = ' + str(trSet.iloc[trSet.size - 1]))


	#ax01.legend(loc='upper left')
	ax02.legend(loc='upper left')
	ax03.legend(loc='upper left')
	ax04.legend(loc='upper right')


# interval: draw new frame every 'interval' ms
simulation = animation.FuncAnimation(f0, updateData, interval=20)

plt.show()

