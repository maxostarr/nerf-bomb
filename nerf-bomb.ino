#include <LiquidCrystal_I2C.h>

#include <Keypad.h>

#define HORN 12
#define SPEAKER 50

#define GREEN_LED 34
#define WHITE_LED 32
#define RED_LED 30

#define PW_LENGTH 0
#define TIMER 1
#define READY 2
#define PLAY_UNARMED 3
#define PLAY_ARMED 4
#define PLAY_ARMED_SHOW_PW 5
#define EXPLODE 6
#define DISARMED 7

#define pulseTime 100

#define ROW_NUM 4
#define COLUMN_NUM 3

#define SEG_A 15
#define SEG_B 19
#define SEG_C 4
#define SEG_D 6
#define SEG_E 7
#define SEG_F 16
#define SEG_G 3

#define SEG_DP 5
#define SEG_1 14
#define SEG_2 17
#define SEG_3 18
#define SEG_4 2

char keys[ROW_NUM][COLUMN_NUM] = {
    {'1', '2', '3'},
    {'4', '5', '6'},
    {'7', '8', '9'},
    {'*', '0', '#'}};
// https://cdn.sparkfun.com/assets/7/e/f/6/f/sparkfun_keypad.pdf
byte pin_rows[ROW_NUM] = {46, 36, 38, 42};  // connect to the row pinouts of the keypad
byte pin_column[COLUMN_NUM] = {44, 48, 40}; // connect to the column pinouts of the keypad

Keypad keypad = Keypad(makeKeymap(keys), pin_rows, pin_column, ROW_NUM, COLUMN_NUM);

LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C address 0x27, 16 column and 2 rows

String input = "";
int state = PW_LENGTH;
int i, colp, val, pwLen;
uint32_t gameTime;
String password = "";
int alertState = LOW;
int alertInterval = 1000;
unsigned long alertOnTime = 0;
unsigned long startTime = 0;
unsigned long startExplode = 0;
unsigned long startShowPW = 0;
unsigned long startDisarm = 0;

void setup()
{
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(WHITE_LED, LOW);
  digitalWrite(RED_LED, LOW);
  digitalWrite(HORN, LOW);

  pinMode(HORN, OUTPUT);
  pinMode(SPEAKER, OUTPUT);

  pinMode(SEG_A, OUTPUT);
  pinMode(SEG_B, OUTPUT);
  pinMode(SEG_C, OUTPUT);
  pinMode(SEG_D, OUTPUT);
  pinMode(SEG_E, OUTPUT);
  pinMode(SEG_F, OUTPUT);
  pinMode(SEG_G, OUTPUT);

  pinMode(SEG_DP, OUTPUT);
  pinMode(SEG_1, OUTPUT);
  pinMode(SEG_2, OUTPUT);
  pinMode(SEG_3, OUTPUT);
  pinMode(SEG_4, OUTPUT);

  pinMode(GREEN_LED, OUTPUT);
  pinMode(WHITE_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);

  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);

  // Print a message to the LCD.
  lcd.print("Password Length");
  lcd.setCursor(0, 1);
  digitalWrite(RED_LED, HIGH);
}

void loop()
{
  lcd.setCursor(0, 1);

  if (state == EXPLODE)
  {
    explode();
    return;
  }

  char key = keypad.getKey();

  if (state == PLAY_ARMED || state == PLAY_ARMED_SHOW_PW)
  {
    displayTimeLeft();
    doBlink();
  }

  if (state == PLAY_ARMED_SHOW_PW)
  {
    playArmedShowPW();
    return;
  }

  if (state == DISARMED && millis() - startDisarm > 10000)
  {
    toPwLength();
    return;
  }

  if (key)
  {
    if (key == '#')
    {
      submit();
    }
    else if (key == '*')
    {
      if (state == PLAY_ARMED)
      {
        state = PLAY_ARMED_SHOW_PW;
        startShowPW = millis();
        return;
      }
      backspace();
    }
    else if (state != READY)
    {
      input += key;
      lcd.print(input);
    }
  }
}

void toPwLength()
{
  state = PW_LENGTH;
  input = "";
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Password Length");
  lcd.setCursor(0, 1);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(RED_LED, HIGH);
}

void backspace()
{
  input.remove(input.length() - 1);
  lcd.setCursor(input.length(), 1);
  lcd.print(" ");
}

void submit()
{
  switch (state)
  {
  case PW_LENGTH:
  {
    pwLen = input.toInt();
    if (pwLen > 16 || pwLen < 1)
    {
      lcd.clear();
      lcd.print("Invalid");
      delay(1000);
      lcd.clear();
      lcd.print("Password Length");
      input = "";
      return;
    }
    input = "";
    lcd.print("                ");
    lcd.setCursor(0, 0);
    lcd.print("Game Time (sec) ");
    state = TIMER;
    break;
  }
  case TIMER:
  {
    gameTime = (uint32_t)input.toInt();
    input = "";
    lcd.print("                ");
    lcd.setCursor(0, 0);
    lcd.print("Press # To Start");
    genPW();
    state = READY;
    break;
  }
  case READY:
  {
    digitalWrite(RED_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(password);
    state = PLAY_UNARMED;
    break;
  }
  case PLAY_UNARMED:
  {
    if (input == password)
    {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Enter Password");
      digitalWrite(GREEN_LED, LOW);
      state = PLAY_ARMED;
      startTime = millis();
    }
    else
    {
      lcd.print("                ");
    }
    input = "";
    break;
  }
  case PLAY_ARMED:
  {
    if (input == password)
    {
      state = DISARMED;
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("BOMB DISARMED");
      startDisarm = millis();
      digitalWrite(RED_LED, LOW);
      digitalWrite(GREEN_LED, HIGH);
    }
    else
    {
      uint32_t timeRemaining = (gameTime * 1000) - (millis() - startTime);
      gameTime = gameTime - (timeRemaining / 2000);
      lcd.print("                ");
    }
    input = "";
    break;
  }
  }
}

void doBlink()
{
  unsigned long currentMillis = millis();

  if (alertState == LOW && currentMillis - alertOnTime >= alertInterval)
  {
    // save the last time you blinked the LED
    alertOnTime = currentMillis;

    alertState = HIGH;

    unsigned long timeSinceStart = currentMillis - startTime;
    unsigned long timeLeft = gameTime * 1000 - timeSinceStart;
    // set alert interval to 1/10 of time left
    alertInterval = min(timeLeft / 10, 1000);

    // set the LED with the ledState of the variable:
    digitalWrite(RED_LED, alertState);
    tone(SPEAKER, 1700, pulseTime);
  }
  if (alertState == HIGH && currentMillis - alertOnTime >= pulseTime)
  {
    alertState = LOW;

    // set the LED with the ledState of the variable:
    digitalWrite(RED_LED, alertState);
  }
}

void genPW()
{
  int generated = 0;
  randomSeed(millis());
  while (generated < pwLen)
  {
    byte randomValue = random(0, 9);
    char letter = randomValue + '0';
    generated++;
    password += letter;
  }
}

void displayTimeLeft()
{
  uint32_t timeSinceStart = millis() - startTime;
  uint32_t timeLeft = (gameTime * 1000) - timeSinceStart;

  uint seconds = timeLeft / 1000;
  uint minutes = seconds / 60;
  seconds = seconds % 60;

  if (seconds == 0 && minutes == 0)
  {
    state = EXPLODE;
    startExplode = millis();
    // turn off red led
    digitalWrite(RED_LED, LOW);
    return;
  }

  uint digit1 = minutes / 10;
  uint digit2 = minutes % 10;
  uint digit3 = seconds / 10;
  uint digit4 = seconds % 10;

  displayDigit(digit1, 1);
  displayDigit(digit2, 2);
  displayDigit(digit3, 3);
  displayDigit(digit4, 4);

  // display time left on 7 segment display
}

void playArmedShowPW()
{
  // display password on LCD for 5 seconds then return to play armed mode
  if (millis() - startShowPW >= 5000)
  {
    state = PLAY_ARMED;
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Enter Password");
    return;
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(password);
}

void explode()
{
  lcd.clear();
  displayDigit(0, 1);
  displayDigit(0, 2);
  displayDigit(0, 3);
  displayDigit(0, 4);
  // light white led for 1 second
  if (!digitalRead(WHITE_LED) && millis() - startExplode < 1000)
  {
    digitalWrite(WHITE_LED, HIGH);
  }
  // if time since start of explode is greater than 1 second
  if (millis() - startExplode > 1000)
  {
    // turn off white led
    digitalWrite(WHITE_LED, LOW);
    // start horn
    digitalWrite(HORN, HIGH);
  }

  // if time since start of explode is greater than 4 seconds
  if (millis() - startExplode > 4000)
  {
    // turn off horn
    digitalWrite(HORN, LOW);
  }

  // if time since start of explode is greater than 7 seconds
  if (millis() - startExplode > 7000)
  {
    // reset game
    toPwLength();
  }
}

void displayDigit(uint x, uint digit)
{
  // turn off all segments
  digitalWrite(SEG_1, HIGH);
  digitalWrite(SEG_2, HIGH);
  digitalWrite(SEG_3, HIGH);
  digitalWrite(SEG_4, HIGH);

  // turn off decimal point
  digitalWrite(SEG_DP, LOW);

  switch (digit)
  {
  case 1:
    digitalWrite(SEG_1, LOW);
    break;
  case 2:
    digitalWrite(SEG_2, LOW);
    // Display decimal point
    digitalWrite(SEG_DP, HIGH);
    break;
  case 3:
    digitalWrite(SEG_3, LOW);
    break;
  case 4:
    digitalWrite(SEG_4, LOW);
    break;
  }

  switch (x)
  {
  case 1:
    one();
    break;
  case 2:
    two();
    break;
  case 3:
    three();
    break;
  case 4:
    four();
    break;
  case 5:
    five();
    break;
  case 6:
    six();
    break;
  case 7:
    seven();
    break;
  case 8:
    eight();
    break;
  case 9:
    nine();
    break;
  default:
    zero();
    break;
  }

  delay(2);
}

void one()
{
  digitalWrite(SEG_A, LOW);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, LOW);
  digitalWrite(SEG_E, LOW);
  digitalWrite(SEG_F, LOW);
  digitalWrite(SEG_G, LOW);
}

void two()
{
  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, LOW);
  digitalWrite(SEG_D, HIGH);
  digitalWrite(SEG_E, HIGH);
  digitalWrite(SEG_F, LOW);
  digitalWrite(SEG_G, HIGH);
}

void three()
{
  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, HIGH);
  digitalWrite(SEG_E, LOW);
  digitalWrite(SEG_F, LOW);
  digitalWrite(SEG_G, HIGH);
}

void four()
{
  digitalWrite(SEG_A, LOW);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, LOW);
  digitalWrite(SEG_E, LOW);
  digitalWrite(SEG_F, HIGH);
  digitalWrite(SEG_G, HIGH);
}

void five()
{
  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, LOW);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, HIGH);
  digitalWrite(SEG_E, LOW);
  digitalWrite(SEG_F, HIGH);
  digitalWrite(SEG_G, HIGH);
}

void six()
{
  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, LOW);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, HIGH);
  digitalWrite(SEG_E, HIGH);
  digitalWrite(SEG_F, HIGH);
  digitalWrite(SEG_G, HIGH);
}

void seven()
{
  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, LOW);
  digitalWrite(SEG_E, LOW);
  digitalWrite(SEG_F, LOW);
  digitalWrite(SEG_G, LOW);
}

void eight()
{
  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, HIGH);
  digitalWrite(SEG_E, HIGH);
  digitalWrite(SEG_F, HIGH);
  digitalWrite(SEG_G, HIGH);
}

void nine()
{
  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, HIGH);
  digitalWrite(SEG_E, LOW);
  digitalWrite(SEG_F, HIGH);
  digitalWrite(SEG_G, HIGH);
}

void zero()
{
  digitalWrite(SEG_A, HIGH);
  digitalWrite(SEG_B, HIGH);
  digitalWrite(SEG_C, HIGH);
  digitalWrite(SEG_D, HIGH);
  digitalWrite(SEG_E, HIGH);
  digitalWrite(SEG_F, HIGH);
  digitalWrite(SEG_G, LOW);
}
