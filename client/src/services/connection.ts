import IConnection from '../models/connection';
import { Terminal } from 'xterm';

// import http from './http';

class ConnectService {
  public ws : WebSocket;

  extractDataObject(data: IConnection): string {
    return Object.entries(data).map((a) => `${a[0]}=${a[1]}`).join('&');
  }

  connect(data: IConnection) {
    const url = this.extractDataObject(data);
    this.ws = new WebSocket(`ws://localhost:2224/ws?${url}`)
  }

  updateSizes(cols: Number, rows: Number) {
      const wsMessage = JSON.stringify({type: 'resize', cols, rows })
      this.ws.send(wsMessage);
  }

  websocketListener(term: Terminal) {
    let handleMessage = (event: any) => {
      term.write(event.data) ;
    }

    let handleData = (data: any) => {
      const wsData = JSON.stringify({command: data, type: 'cmd'})
      this.ws.send(wsData)
    }

    this.ws.onmessage = handleMessage;
    term.onData(handleData);

    this.ws.addEventListener('close', () => {
      this.ws.removeEventListener("message", handleMessage);
      // maybe there is an alternative to term dispose
    })
  }

  closeConnection() {
    this.ws.close();
  }
}

export default ConnectService;
