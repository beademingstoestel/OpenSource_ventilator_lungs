//#include "BasicStepperDriver.h"
#include <AccelStepper.h>

unsigned long timestamp; 
unsigned long time_diff = 10; // try to loop every 40 ms​

#define MOTOR_STEPS 400
#define RPM 100​
// for your motor
#define DIR 10
#define STEP 9
#define MICROSTEPS 2
//BasicStepperDriver stepper(MOTOR_STEPS, DIR, STEP);
AccelStepper stepper(1, STEP, DIR); 

int stepCount = 0; // number of steps the motor has take
unsigned long currentMicros;
int motor_angle = 250;//600;
unsigned long motor_time;
enum motor_state_t{UP,DOWN};
motor_state_t motor_state=DOWN;

float CurrentPressurePatient;
//----------------------------------------------------------------------------------------------------
//-----------------------------------------    BEGIN OF SETUP ----------------------------------------
void setup()
{
  Serial.begin(115200);
  stepper.setMaxSpeed(10000); 
  stepper.setAcceleration(1000);
  timestamp = millis();
  motor_time = millis();
  //stepper.begin(100, MICROSTEPS);
  stepper.setSpeed(-1000); 
  BME280_Setup(); 
}
//----------------------------------------------------------------------------------------------------
//-----------------------------------------    END OF SETUP ------------------------------------------
void loop()
{   
  BREATHE_CONTROL_setPointInhalePressure(3);
  long new_time = millis();
  /*if ((motor_time+100<=new_time)&&(motor_state==DOWN))
  {
    stepper.rotate(-motor_angle);
    motor_time=new_time;
    motor_state=UP;
  }  
  if ((motor_time+100<=new_time)&&(motor_state==UP))
  {
    stepper.rotate(+motor_angle);
    motor_time=new_time;
    motor_state=DOWN;
  }*/
  stepper.run();
  if (timestamp+time_diff<=new_time)
  {
    if (BME280_readPressurePatient(&CurrentPressurePatient))
    {    
      BREATHE_CONTROL_setInhalePressure(CurrentPressurePatient);
      float angle = BREATHE_CONTROL_Regulate();      
      stepper.moveTo(angle);
      BREATHE_getPositionFeedback(stepper.currentPosition());
      
      /*Serial.print("Pinhale: ");
      Serial.print(CurrentPressurePatient);
      Serial.print(" PID: ");
      Serial.print(stepper.currentPosition());//BREATHE_getPID());
      Serial.print(" , at time: ");
      Serial.println(new_time-timestamp);*/
    }
    else
    {
      //Serial.println("Pressure sensors failing");
    }
    timestamp=new_time;
  }

}
