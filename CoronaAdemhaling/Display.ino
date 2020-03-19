#ifndef MEDICAL_DISPLAY_LCD
#define MEDICAL_DISPLAY_LCD

#include <Wire.h> // For I2C
#include <LCD.h> // For LCD
#include <LiquidCrystal_I2C.h> // Added library*

// All variables and structs for our display

// Set the pins on the I2C chip used for LCD connections
// ADDR,EN,R/W,RS,D4,D5,D6,D7
// Possible addresses for the displays are 0x27 and 0x3F, tried both, 3F worked
LiquidCrystal_I2C display(0x3F,2,1,0,4,5,6,7);

uint16_t Display_width = 20; // # chars next to each other
uint16_t Display_height = 4; // # rows of characters 

//-------------------------------------------------------------------------------
//  current readings of the patient
float Display_current_P = 0; // current pressure
float Display_current_V = 0; // current volume
float Display_current_bpm = 0; // breaths per minute
float Display_current_trigger = 0; // current trigger value

//  current setpoints of the patient
float Display_setpoint_P = 0; // current pressure
float Display_setpoint_V = 0; // current volume
float Display_setpoint_bpm = 0; // breaths per minute
float Display_setpoint_trigger = 0; // current trigger value

// which modus?
uint8_t Display_modus = 0;
//-------------------------------------------------------------------------------
void Display_Init()
{   
    display.begin (20,4); // 20 x 4 LCD module
    display.setBacklightPin(3,POSITIVE); // BL, BL_POL
    display.setBacklight(HIGH);
    display.print("Hello, Medical world!"); 
}
//-------------------------------------------------------------------------------
void Display_clear()
{
    display.clear();
}
//-------------------------------------------------------------------------------
void Display_setLabels()
{
    display.setCursor(0,0);
    display.print("P: ");
    display.setCursor(0,1);
    display.print("V: ");
    display.setCursor(0,2);
    display.print("B: ");
    display.setCursor(0,3);
    display.print("T: ");
}
//-------------------------------------------------------------------------------
void Display_DisplayCurrentValues()
{
    //-- now write to the screen
    display.setCursor(2,0);
    display.print("      ");
    display.setCursor(2,0);
    display.print(Display_current_P);
    display.setCursor(2,1);
    display.print("      ");
    display.setCursor(2,1);
    display.print(Display_current_V);
    display.setCursor(2,2);
    display.print("      ");
    display.setCursor(2,2);
    display.print(Display_current_bpm);
    display.setCursor(2,3);
    display.print("      ");
    display.setCursor(2,3);
    display.print(Display_current_trigger);
}
//-------------------------------------------------------------------------------
void Display_DisplaySetpointValues()
{
    //-- now write to the screen
    display.setCursor(10,0);
    display.print(">        ");
    display.setCursor(12,0);
    display.print(Display_setpoint_P);
    display.setCursor(10,1);
    display.print(">        ");
    display.setCursor(12,1);
    display.print(Display_setpoint_V);
    display.setCursor(10,2);
    display.print(">        ");
    display.setCursor(12,2);
    display.print(Display_setpoint_bpm);
    display.setCursor(10,3);
    display.print(">        ");
    display.setCursor(12,3);
    display.print(Display_setpoint_trigger);
}
//-------------------------------------------------------------------------------
void Display_DisplayModus()
{
    display.setCursor(19,0);
    char c = Display_modus+65; // ascii table for A (if 0)
    display.print(c);
}
//-------------------------------------------------------------------------------
void Display_setPressure(float current)
{
    Display_current_P=current;
}
//-------------------------------------------------------------------------------
void Display_setVolume(float current)
{
    Display_current_V=current;
}
//-------------------------------------------------------------------------------
void Display_setBeathsPerMinute(float current)
{
    Display_current_bpm=current;
}
//-------------------------------------------------------------------------------
void Display_setTrigger(float current)
{
    Display_current_trigger=current;
}
//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
void Display_setpointPressure(float current)
{
    Display_setpoint_P=current;
}
//-------------------------------------------------------------------------------
void Display_setpointVolume(float current)
{
    Display_setpoint_V=current;
}
//-------------------------------------------------------------------------------
void Display_setpointBeathsPerMinute(float current)
{
    Display_setpoint_bpm=current;
}
//-------------------------------------------------------------------------------
void Display_setpointTrigger(float current)
{
    Display_setpoint_trigger=current;
}
//-------------------------------------------------------------------------------
void Display_setModus(uint8_t modus)
{
    Display_modus = modus;
}
//-------------------------------------------------------------------------------
#endif