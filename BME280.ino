/***************************************************************************
  This is a library for the BME280 humidity, temperature & pressure sensor
  This example shows how to take Sensor Events instead of direct readings
  
  Designed specifically to work with the Adafruit BME280 Breakout
  ----> http://www.adafruit.com/products/2652

  These sensors use I2C or SPI to communicate, 2 or 4 pins are required
  to interface.

  Adafruit invests time and resources providing this open source code,
  please support Adafruit and open-source hardware by purchasing products
  from Adafruit!

  Written by Limor Fried & Kevin Townsend for Adafruit Industries.
  BSD license, all text above must be included in any redistribution
 ***************************************************************************/
#include <Wire.h>
#include <SPI.h>
#include <Adafruit_BME280.h>
//-----------------------------------------------------------------------------------------------
Adafruit_BME280 bme1;//(0x76);
Adafruit_BME280 bme2;//(0x77); // use I2C interface
Adafruit_Sensor *bme_pressure_ref = bme1.getPressureSensor();
Adafruit_Sensor *bme_pressure_patient = bme2.getPressureSensor();
//-----------------------------------------------------------------------------------------------
bool BME280_Setup() 
{
    if (!bme1.begin(0x76)) 
    {    
        while (1) delay(10);
    }
    if (!bme2.begin(0x77)) 
    {    
        while (1) delay(10);
    }
    return true;
}
//-----------------------------------------------------------------------------------------------
float BME280_readPressurePatient() 
{
    sensors_event_t  pressure_event;
    bme_pressure_patient->getEvent(&pressure_event);
    return pressure_event.pressure;
}
//-----------------------------------------------------------------------------------------------
float BME280_readPressureRef() 
{
    sensors_event_t  pressure_event;
    bme_pressure_ref->getEvent(&pressure_event);
    return pressure_event.pressure;
}
//-----------------------------------------------------------------------------------------------