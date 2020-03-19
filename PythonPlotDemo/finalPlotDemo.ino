int P = 0;
int V = 0;
int Tr = 0;
int Pset = 12;
int Vset = 20;
int BPMset = 8;
int Trset = 15;
int cnt = 0;

void setup()
{
  Serial.begin(115200);
}

void loop()
{

  if(cnt == 20) 
  {cnt=0;Tr=!Tr;}
  else cnt+=1;
  Serial.print(P);
  Serial.print(",");
  Serial.print(V);
  Serial.print(",");
  Serial.print(Tr);
  Serial.print(",");
  Serial.print(Pset);
  Serial.print(",");
  Serial.print(Vset);
  Serial.print(",");
  Serial.print(BPMset);
  Serial.print(",");
  Serial.println(Trset);
  P += 1;
  V += 2;
  delay(100);
}
