/*
  DigitalReadSerial

  Reads a digital input on pin 2, prints the result to the Serial Monitor

  This example code is in the public domain.

  http://www.arduino.cc/en/Tutorial/DigitalReadSerial
*/

// LED on pin 13

int led = 13;

int rcv;

int flag = 0;
// the setup routine runs once when you press reset:
void setup() {
  // initialize serial communication at 9600 bits per second:
  pinMode(led, OUTPUT);
  Serial.begin(115200);
}

// the loop routine runs over and over again forever:
void loop() {
  Serial.println("bpm=1");
  Serial.println("Vol=2"); 
  Serial.println("Trig=3");
  Serial.println("Pres=4");

  if (Serial.available() > 0) {
    rcv = Serial.read();
    if(rcv == 'T'){
      flag=1;
    }

    rcv = Serial.read(); // handle newline
  }

  if (flag == 1){
    Serial.println("OK");
  } else {
    Serial.println("NOK");
  }
 
 
  delay(1000);
}
