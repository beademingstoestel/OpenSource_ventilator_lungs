
int ledPin = 13;
int led = 0;

float peep = 0;
float vt = 0;
float rr = 0;
float pi = 12;
float trigger = 0; // 0 = inspiration, 1 = expiration

int x = 0;
int cnt = 0;

void setup()
{
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);
}

void loop()
{
  if(cnt == 50) 
  {cnt=0;trigger=!trigger;}
  else cnt+=1;
  
  x+= 1;
  
  pi = cos(DEG_TO_RAD*x);
  vt = sin(DEG_TO_RAD*x);

  if(Serial.available() > 0)
  {
    if(Serial.read() == 1)
    {
      led=1-led;digitalWrite(ledPin,led);
      //Serial.println(Serial.availableForWrite());
      while(Serial.availableForWrite()<63){} 
      Serial.print(pi);
      Serial.print(",");
      Serial.print(vt);
      Serial.print(",");
      Serial.print(rr);
      Serial.print(",");
      Serial.print(peep);
      Serial.print(",");
      Serial.println(trigger);
      //while(Serial.availableForWrite()<4){}Serial.println(Serial.availableForWrite());
    }
  }
  //delay(30);
}