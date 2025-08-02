#include <Arduino.h>

// Running on arduino nano
// Left pin is D4
// Right pin is D5

const int LEFT_PIN = 5;
const int RIGHT_PIN = 3;
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
  Serial.println(command);

  switch (command)
  {
  case ENABLE_LEFT:
    digitalWrite(LEFT_PIN, HIGH);
    Serial.println("Left walkie enabled");
    break;
  case ENABLE_RIGHT:
    digitalWrite(RIGHT_PIN, HIGH);
    Serial.println("Right walkie enabled");
    break;
  case DISABLE_LEFT:
    digitalWrite(LEFT_PIN, LOW);
    Serial.println("Left walkie disabled");
    break;
  case DISABLE_RIGHT:
    digitalWrite(RIGHT_PIN, LOW);
    Serial.println("Right walkie disabled");
    break;
  default:
    Serial.println("Invalid command");
    break;
  }

  Serial.print("Processed command: ");
  Serial.println(command);
}

void setup()
{
  pinMode(LEFT_PIN, OUTPUT);
  pinMode(RIGHT_PIN, OUTPUT);
  digitalWrite(LEFT_PIN, LOW);
  digitalWrite(RIGHT_PIN, LOW);

  Serial.begin(9600);
  while (!Serial)
    ;

  Serial.println("Hello world");
  Serial.println("L - Enable left walkie");
  Serial.println("R - Enable right walkie");
}

void loop()
{
}

// This function is called automatically when serial data is available
void serialEvent()
{
  while (Serial.available())
  {
    Serial.println("Serial data available");
    char inChar = (char)Serial.read();
    if (inChar != '\n' && inChar != '\r')
    {
      processCommand(inChar);
    }
  }
}
