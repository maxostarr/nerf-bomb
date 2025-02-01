import { spawn } from 'child_process';

const AUDIO_FILE_PATH = '/home/rezo/Downloads/sample-3s.mp3';
// const AUDIO_FILE_PATH = '/home/rezo/Downloads/PinkPanther30.wav';


export function playAudio(pan: 'left' | 'right' | 'center') {
  // Define pan filter based on argument
  let panFilter;
  switch (pan) {
    case 'left':
      panFilter = 'pan=stereo|c0=FL';  // Route only to left speaker
      break;
    case 'right':
      panFilter = 'pan=stereo|c1=FR';  // Route only to right speaker
      break;
    default:
      panFilter = null;  // No pan filter for center
  }

  const args = ['-nodisp', '-autoexit'];
  if (panFilter) {
    args.push('-af', panFilter);
  }
  args.push(AUDIO_FILE_PATH);

  console.log('Playing audio with args:', args);

  const player = spawn('ffplay', args);

  player.on('exit', (code) => {
    console.log(`Child process exited with code ${code}`);
  });

  player.on('error', (err) => {
    console.error('Failed to start subprocess.', err);
  });

  player.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  player.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
}

export function parseAudioDevices(output: string) {
  const devices = [];
  const lines = output.toString().split('\n');


  for (const line of lines) {
    const cardMatch = line.match(/card (\d+): (\w+) \[(.*?)\], device (\d+): (.*?) \[(.*?)\]/);

    if (cardMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, cardNum, cardShortName, cardFullName, deviceNum, deviceType, deviceName] = cardMatch;

      const device = {
        cardNumber: parseInt(cardNum),
        cardName: cardFullName,
        cardShortName,
        deviceNumber: parseInt(deviceNum),
        deviceType,
        deviceName,
        id: `${cardNum},${deviceNum}`
      };

      devices.push(device);
    }
  }

  return devices;
}

// Update getAudioPlaybackDevices to use the parser
export function getAudioPlaybackDevices() {
  return new Promise((resolve, reject) => {
    const aplay = spawn('aplay', ['-l']);
    let output = '';

    aplay.stdout.on('data', (data) => {
      output += data.toString();
    });

    aplay.on('exit', (code) => {
      if (code === 0) {
        const devices = parseAudioDevices(output);
        resolve(devices);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    aplay.on('error', (err) => {
      reject(err);
    });
  });
}

// Example usage:
// getAudioPlaybackDevices()
//   .then(devices => console.log(JSON.stringify(devices, null, 2)))
//   .catch(err => console.error('Error:', err));

playAudio('left')