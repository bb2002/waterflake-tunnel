import { createServer, Server, Socket } from 'net';
import { Tunnel } from '../tunnel/types/Tunnel';

class ProxyServer {
  private readonly inPort: number;
  private readonly outPort: number;
  private inPortServer?: Server;
  private outPortServer?: Server;

  private idleInServerConnections: Socket[] = [];

  constructor(private readonly tunnel: Tunnel) {
    this.inPort = tunnel.inPort;
    this.outPort = tunnel.outPort;
  }

  async bootstrap(): Promise<void> {
    this.inPortServer = createServer(this.onInPortServerConnected);
    this.outPortServer = createServer(this.onOutPortServerConnected);

    return new Promise<void>((resolve, reject) => {
      try {
        this.inPortServer.listen(this.inPort, () => {
          this.outPortServer.listen(this.outPort, () => {
            resolve();
          });
        });
      } catch (ex) {
        console.error(ex);
        reject(ex);
      }
    });
  }

  public getInPort() {
    return this.inPort;
  }

  public getOutPort() {
    return this.outPort;
  }

  public getTunnel() {
    return this.tunnel;
  }

  private onInPortServerConnected = (socket: Socket) => {
    console.log(
      'onInPortServerConnected length:',
      this.idleInServerConnections.length,
    );
    this.idleInServerConnections.push(socket);
    socket.on('data', this.onInServerDataTransfer);
    socket.on('error', this.onInServerError);
  };

  private onOutPortServerConnected = (socket: Socket) => {
    console.log('onOutPortServerConnected');
    if (this.idleInServerConnections.length <= 0) {
      socket.destroy();
    }

    // 두 연결에 대한 PIPE 를 만들어 터널 생성
    const idleInServerConnection = this.idleInServerConnections.pop();
    idleInServerConnection.pipe(socket);
    socket.pipe(idleInServerConnection);
  };

  private onInServerDataTransfer = (data: any) => {
    console.log(`onInServerDataTransfer ${data.length}`);
  };

  private onInServerError = () => {
    console.log('onInServerError');
  };
}

export default ProxyServer;
