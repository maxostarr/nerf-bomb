#include <Arduino.h>

const int LEFT_PIN = 21;
const int RIGHT_PIN = 22;
const int BUFFER_SIZE = 64;

char serialBuffer[BUFFER_SIZE];
int bufferIndex = 0;

enum Commands
{
  ENABLE_LEFT = 'L',
  ENABLE_RIGHT = 'R',
  DISABLE_LEFT = 'l',
  DISABLE_RIGHT = 'r',
};

void processCommand(char command)
{
  Serial.write(command);

  switch (command)
  {
  case ENABLE_LEFT:
    digitalWrite(LEFT_PIN, HIGH);
    Serial.println("Left motor enabled");
    break;
  case ENABLE_RIGHT:
    digitalWrite(RIGHT_PIN, HIGH);
    Serial.println("Right motor enabled");
    break;
  case DISABLE_LEFT:
    digitalWrite(LEFT_PIN, LOW);
    Serial.println("Left motor disabled");
    break;
  case DISABLE_RIGHT:
    digitalWrite(RIGHT_PIN, LOW);
    Serial.println("Right motor disabled");
    break;
  default:
    break;
  }
}

void setup()
{
  pinMode(LEFT_PIN, OUTPUT);
  pinMode(RIGHT_PIN, OUTPUT);
  Serial.begin(115200);
  while (!Serial)
    ;

  Serial.println("Hello world");
  Serial.println("L - Enable left motor");
  Serial.println("R - Enable right motor");
}

void loop()
{
}

// This function is called automatically when serial data is available
void serialEvent()
{
  while (Serial.available())
  {
    char inChar = (char)Serial.read();
    if (inChar != '\n' && inChar != '\r')
    {
      processCommand(inChar);
    }
  }
}
