import { spawn } from 'child_process';

const AUDIO_FILE_PATH = '/home/rezo/Downloads/sample-3s.mp3';
let hwId = 'hw:2,0';

export function playAudio(pan: 'left' | 'right' | 'center') {
  let panFilter;
  switch (pan) {
    case 'left':
      panFilter = 'pan=stereo|c0=c0';
      break;
    case 'right':
      panFilter = 'pan=stereo|c1=c1';
      break;
    default:
      panFilter = 'pan=stereo|c0=0.5|c1=0.5';
  }

  // Base ffmpeg parameters with explicit audio format
  const ffmpegParams = [
    '-i', AUDIO_FILE_PATH,
    // '-filter_complex', `[0:a]${panFilter}[audio]`,
    '-af', panFilter,
    '-acodec', 'pcm_s16le',
    '-ar', '44100',
    '-ac', '2',
    '-thread_queue_size', '4096',
    '-f', 'alsa',
    hwId
  ];

  return new Promise<void>((resolve, reject) => {
    const player = spawn('ffmpeg', ffmpegParams);

    player.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Audio playback failed with code ${code}`);
        reject(new Error(`Audio playback failed with code ${code}`));
      }

      resolve();
    });

    player.on('error', (err) => {
      console.error('Failed to start audio playback:', err);
      reject(err);
    });

    player.stderr.on('data', (data) => {
      console.error(`data: ${data}`);
    });
  })
}

export function parseAudioDevices(output: string) {
  const devices = [];
  const lines = output.toString().split('\n');

  for (const line of lines) {
    const cardMatch = line.match(/card (\d+): (\w+) \[(.*?)\], device (\d+): (.*?) \[(.*?)\]/);

    if (cardMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_, cardNum, cardShortName, cardFullName, deviceNum, deviceType, deviceName] =
        cardMatch;

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

export function setAudioPlaybackDevice(id: string) {
  hwId = id;
}

// Example usage:
// getAudioPlaybackDevices()
//   .then(devices => console.log(JSON.stringify(devices, null, 2)))
//   .catch(err => console.error('Error:', err));

// playAudio('right', 'hw:2,0');
