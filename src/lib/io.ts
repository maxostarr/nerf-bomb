import { ReadlineParser, SerialPort } from 'serialport';

// export class IO {
//   private port: SerialPort;

//   static async ListPorts() {
//     const ports = await SerialPort.list();
//     return ports;
//   }

//   constructor(path: string) {
//     this.port = new SerialPort({
//       port: path,
//       baudRate: 115200
//     });
//   }

//   public write(data: string) {
//     this.port.write(data);
//   }
// }

let port: SerialPort | null = null;
let parser: ReadlineParser


export function connect ( path: string ) {
  console.log( 'Connecting to port', path );

  return new Promise( ( resolve, reject ) => {
    if ( port && port.isOpen ) {
      port.close()
    }

    port = new SerialPort( {
      path,
      baudRate: 9600,
      autoOpen: true,
    }, ( err ) => {
      if ( err ) {
        console.error( 'Port open Error:', err );
        reject( err )
        return
      }
      resolve( false )
    } );
  } )
}

export function write ( data: string ) {
  console.log( 'Writing data:', data );
  if ( !port ) {
    console.error( 'Port not connected' );
    throw new Error( 'Port not connected' );
  }

  port.write( data );
}

export async function listPorts () {
  return await SerialPort.list();
}

export async function disconnect () {
  if ( !port ) {
    throw new Error( 'Port not connected' );
  }

  await port.close();
}

export async function reconnect () {
  if ( !port ) {
    throw new Error( 'Port not connected' );
  }

  await port.close();
  await port.open();
}

export function getPort () {
  return port;
}

export function getParser () {
  return parser;
}

