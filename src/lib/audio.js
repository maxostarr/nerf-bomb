import { spawn } from 'child_process';

// const AUDIO_FILE_PATH = '~/Downloads/sample-3s.mp3';
const AUDIO_FILE_PATH = '~/Downloads/PinkPanther30.wav';


export function playAudio() {
  const player = spawn('ffplay', ['-nodisp', '-autoexit', AUDIO_FILE_PATH]);

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

playAudio();
