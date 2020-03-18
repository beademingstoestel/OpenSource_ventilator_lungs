float CurrentPressurePatient;
float CurrentPressureRef;
//----------------------------------------------------------------------------------------------------
//-----------------------------------------    BEGIN OF SETUP ----------------------------------------
void setup()
{
  Display_Init();
  Display_clear();
  Display_setLabels();

  BME280_Setup();  
   /*// Set off LCD module
   lcd.begin (20,4); // 20 x 4 LCD module
   lcd.setBacklightPin(3,POSITIVE); // BL, BL_POL
   lcd.setBacklight(HIGH);
   lcd.print("Hello, World!");
   lcd.setCursor(0,1);
   lcd.print("Good Day"); 
   lcd.setBacklight("LOW");*/
}
//----------------------------------------------------------------------------------------------------
/*void setupDisplay()
{
  
}*/
//----------------------------------------------------------------------------------------------------
//-----------------------------------------    END OF SETUP ------------------------------------------


void loop()
{
  CurrentPressurePatient = BME280_readPressurePatient();
  delay(10);
  CurrentPressureRef = BME280_readPressureRef();
  Display_DisplayCurrentValues();
  Display_DisplaySetpointValues();
  Display_setPressure(CurrentPressurePatient);
  Display_setpointPressure(CurrentPressureRef);
  Display_DisplayModus();

  delay(100);
}
