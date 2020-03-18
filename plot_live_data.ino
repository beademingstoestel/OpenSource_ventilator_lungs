int P = 0;
int V = 0;
int Tr = 0;
int Pset = 12;
int Vset = 20;
int BPMset = 8;
int Trset = 15;

void setup()
{
  Serial.begin(115200);
}

void loop()
{

  Serial.print(P);
  Serial.print(",");
  Serial.println(V);
  P += 1;
  V += 2;
  delay(100);
}
