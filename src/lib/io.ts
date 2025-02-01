// import { Gpio } from 'onoff'


// const CHANNEL_1 = new Gpio(4, 'out')

// await CHANNEL_1.write(0b1)
// await new Promise((res, rej) => setTimeout(res, 1000))
// await CHANNEL_1.write(0b0)

// CHANNEL_1.unexport()

import player from 'play-sound'

const soundPlayer = player({})
export const playSound = async () => {

  console.log('setting pin high')
  // await new Promise((res, rej) => setTimeout(res, 1000))
  console.log("playingg test file")

  soundPlayer.play('police_s.wav')
  await new Promise((res) => setTimeout(res, 3000))

  console.log("setting pin low")
  // console.log("setting pin high again")
  // gpiox.set_gpio(4, 1)
  // await new Promise((res, rej) => setTimeout(res, 1000))
  // gpiox.set_gpio(4, 0)
}

