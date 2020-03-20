#ifndef BREATHE_CONTROL_H
#define BREATHE_CONTROL_H

// update very 40ms
float PRESSURE_INHALE_SETPOINT = 50;
float VOLUME_SETPOINT = 600; // in ml;
float BREATHING_SPEED_SETPOINT = 10; // in # per second
float current_inhale_pressure = 0;

float Vlung = 0;
bool is_blocking = false;

float MAX_DISPLACEMENT=-500;

//----------------------------------
float Kp = 1;
float Ki = 0.05;
//----------------------------------
float PID_value = 0;
float PID_value_P = 0;
float PID_value_I = 0;
//----------------------------------
float sum = 0;
float PLUNGER_POSITION = 0;

enum BREATHE_PHASE{INHALE, EXHALE, BLOCK}; 
BREATHE_PHASE Breathe_mode = INHALE;
//------------------------------------------------------------------------------
void BREATHE_CONTROL_setPointInhalePressure(float setting)
{
  PRESSURE_INHALE_SETPOINT = setting;
}
//------------------------------------------------------------------------------
float BREATHE_CONTROL_getPointInhalePressure()
{
  return PRESSURE_INHALE_SETPOINT;
}
//------------------------------------------------------------------------------
void BREATHE_CONTROL_setInhalePressure(float setting)
{
  current_inhale_pressure = setting;
}
//------------------------------------------------------------------------------
float BREATHE_CONTROL_getInhalePressure()
{
  return current_inhale_pressure;
}
//------------------------------------------------------------------------------
float BREATHE_getPID()
{
  return sum;  
}
//------------------------------------------------------------------------------
void BREATHE_getPositionFeedback(float value)
{
  if (Breathe_mode==INHALE)
  {
    if (value<MAX_DISPLACEMENT)
    {
      Breathe_mode=EXHALE;
    }
  }
  else if (Breathe_mode==EXHALE)
  {
      sum = 0;
      PID_value_I=0;
      PID_value_P=0;
    if (PLUNGER_POSITION==0)
    {
      Breathe_mode=INHALE;  
    }
  }
}
//------------------------------------------------------------------------------
float BREATHE_CONTROL_Regulate()
{
    float diff = current_inhale_pressure-PRESSURE_INHALE_SETPOINT;
    if (Breathe_mode==INHALE)
    {
      PID_value_P = Kp*diff; 
      PID_value_I += Ki*diff;
      PID_value_I = (PID_value_I>25)?25:PID_value_I;
      PID_value_I = (PID_value_I<-25)?-25:PID_value_I;
      PID_value = PID_value_P + PID_value_I;
      sum+=PID_value;
      /*if (-sum>=MAX_DISPLACEMENT) 
      {
        Breathe_mode = EXHALE;
      }*/
      return sum;
    }
    else if (Breathe_mode==EXHALE)
    {            
      return 0;
    }    
}
//------------------------------------------------------------------------------
#endif
