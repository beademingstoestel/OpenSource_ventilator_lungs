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

#define BME_SPI_SCK 52
#define BME_SPI_MISO 50
#define BME_SPI_MOSI 51 
#define BME_SPI_CS 48
//-----------------------------------------------------------------------------------------------
Adafruit_BME280 bme1;//(0x76);
Adafruit_BME280 bme2;//(0x77); // use I2C interface
Adafruit_BME280 bme3(BME_SPI_CS); // hardware SPI
Adafruit_Sensor *bme_pressure_patient1 = bme1.getPressureSensor();
Adafruit_Sensor *bme_pressure_patient2 = bme2.getPressureSensor();
Adafruit_Sensor *bme_pressure_ref = bme3.getPressureSensor();

#define hPa2cmh2o_scale 1.0197442889221
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
        if (!bme3.begin()) 
    {    
        while (1) delay(10);
    }
    return true;
}
//-----------------------------------------------------------------------------------------------
bool BME280_readPressurePatient(float *value) 
{
    float sensor1, sensor2;
    sensors_event_t  pressure_event1,pressure_event2;
    bme_pressure_patient1->getEvent(&pressure_event1);
    sensor1 =  pressure_event1.pressure*hPa2cmh2o_scale;

    bme_pressure_patient2->getEvent(&pressure_event2);
    sensor2 =  pressure_event2.pressure*hPa2cmh2o_scale;

    if (abs(sensor1-sensor2)<2)
    {
      float ambient = BME280_readPressureRef();
      *value=(sensor1+sensor2)/2 - BME280_readPressureRef() + 0.6;
      return true;
    }
    return false;
}
//-----------------------------------------------------------------------------------------------
float BME280_readPressureRef() 
{
    sensors_event_t  pressure_event;
    bme_pressure_ref->getEvent(&pressure_event);
    return pressure_event.pressure*hPa2cmh2o_scale;
}
//-----------------------------------------------------------------------------------------------
