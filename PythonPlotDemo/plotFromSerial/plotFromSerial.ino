
int ledPin = 13;
int led = 0;

float peep = 0;
float vt = 0;
float rr = 0;
float pi = 12;
float trigger = 0; // 0 = inspiration, 1 = expiration

int x = 0;
int cnt = 0;
bool is_connected = false;
byte msg_received;

void setup()
{
  pinMode(ledPin, OUTPUT);
  Serial.begin(115200);

}

void loop()
{
  if(cnt == 20) 
  {cnt=0;trigger=!trigger;}
  else cnt+=1;
  
  x+= 1;
  
  pi = cos(DEG_TO_RAD*x);
  vt = sin(DEG_TO_RAD*x);

  /*if(Serial.available() > 0)
  {*/
    //if(read_i8() == 1)
    //{
      led=1-led;digitalWrite(ledPin,led);
      //Serial.println(Serial.availableForWrite());
      while(Serial.availableForWrite()<63){} Serial.print(pi);
      /*while(Serial.availableForWrite()<4){}*/ Serial.print(",");
      /*while(Serial.availableForWrite()<4){}*/ Serial.print(vt);
      /*while(Serial.availableForWrite()<4){}*/ Serial.print(",");
      /*while(Serial.availableForWrite()<4){}*/ Serial.print(rr);
      /*while(Serial.availableForWrite()<4){}*/ Serial.print(",");
      /*while(Serial.availableForWrite()<4){}*/ Serial.print(peep);
      /*while(Serial.availableForWrite()<4){}*/ Serial.print(",");
      /*while(Serial.availableForWrite()<4){}*/ Serial.println(trigger);
      //while(Serial.availableForWrite()<4){}Serial.println(Serial.availableForWrite());
    //}
  //}
  delay(30);
}


void wait_for_bytes(int num_bytes, unsigned long timeout)
{
  unsigned long startTime = millis();
  //Wait for incoming bytes or exit if timeout
  while ((Serial.available() < num_bytes) && (millis() - startTime < timeout)){}
}

void write_i8(int8_t num)
{
  Serial.write(num);
}

int8_t read_i8()
{
  wait_for_bytes(1, 100); // Wait for 1 byte with a timeout of 100 ms
  return (int8_t) Serial.read();
}

int16_t read_i16()
{
  int8_t buffer[2];
  wait_for_bytes(2, 100); // Wait for 2 bytes with a timeout of 100 ms
  read_signed_bytes(buffer, 2);
  return (((int16_t) buffer[0]) & 0xff) | (((int16_t) buffer[1]) << 8 & 0xff00);
}

// NOTE : Serial.readBytes is SLOW
// this one is much faster, but has no timeout
void read_signed_bytes(int8_t* buffer, size_t n)
{
  size_t i = 0;
  int c;
  while (i < n)
  {
    c = Serial.read();
    if (c < 0) break;
    *buffer++ = (int8_t) c; // buffer[i] = (int8_t)c;
    i++;
  }
}
