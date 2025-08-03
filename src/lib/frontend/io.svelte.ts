import { get, post, put } from './apiClient';

export const devices = $state( {
  serial: [] as PortOption[],
  audio: [] as AudioDeviceDetails[]
} )

export interface PortOption {
  label: string;
  path: string;
};

export interface AudioDeviceDetails {
  cardNumber: number;
  cardName: string;
  cardShortName: string;
  deviceNumber: number;
  deviceType: string;
  deviceName: string;
  id: string;
}

export async function fetchSerialPorts () {
  const response = await get( `io/port` )
    .catch( () => null )

  if ( !response ) {
    throw new Error( 'Failed to fetch serial ports' )
  }

  devices.serial = response.map( ( port: { path: string; manufacturer?: string } ) => ( {
    label: `${ port.path } - ${ port.manufacturer }`,
    path: port.path
  } ) );
}

export async function setSerialPort ( port: PortOption ) {
  return await post( 'io/port', { path: port.path } )
    .catch( ( e ) => ( {
      success: false,
      error: `HTTP error: ${ e }`
    } ) )
}

export async function fetchAudioDevices () {
  const res = await get( 'audio' )
    .catch( () => null )

  if ( !res ) {
    throw new Error( 'Failed to fetch audio devices' )
  }

  devices.audio = res
}

export async function setAudioDevice ( deviceId: string ) {
  return await put( 'audio', { hwId: `hw:${ deviceId }` } ).catch( () => ( { success: false } ) )
}

export async function testAudio ( pan: 'left' | 'right' ) {
  return post( 'io/control', { pan } ).catch( () => ( { success: false } ) )
}