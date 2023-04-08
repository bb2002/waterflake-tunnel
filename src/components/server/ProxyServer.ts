import { createServer, Server, Socket } from 'net';
import { Tunnel } from '../tunnel/types/Tunnel';

class ProxyServer {
  private inPortServer?: Server;
  private outPortServer?: Server;

  private inServerConnectionId = 0;
  private inServerConnections: Map<number, Socket> = new Map<
    number,
    Socket
  >();

  private outServerConnectionId = 0;
  private outServerConnections: Map<number, Socket> = new Map<number, Socket>();

  constructor(private readonly tunnel: Tunnel) {}

  async bootstrap(): Promise<void> {
    this.inPortServer = createServer(this.onInServerConnected);
    this.outPortServer = createServer(this.onOutServerConnected);

    return new Promise<void>((resolve, reject) => {
      try {
        this.inPortServer.listen(this.getInPort(), () => {
          this.outPortServer.listen(this.getOutPort(), () => {
            resolve();
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  private onInServerConnected = (socket: Socket) => {
    // TODO
    // Socket 에서 인증 정보를 읽어오는 로직 추가
    const connectionId = ++this.inServerConnectionId;
    socket.on('data', this.onInServerDataTransfer);
    socket.on('error', this.onInServerError);
    socket.on('end', () => this.onInServerDisconnected(connectionId))
    this.inServerConnections.set(connectionId, socket);
  }

  private onOutServerConnected = (socket: Socket) => {

  }

  private onInServerDataTransfer = (data: any[]) => {

  }

  private onOutServerDataTransfer = (data: any[]) => {

  }

  private onInServerError = (err: Error) => {
    // TODO
    // 로깅하거나, 에러를 기록
  }

  private onOutServerError = (err: Error) => {

  }

  private onInServerDisconnected = (connectionId: number) => {
    const connection = this.inServerConnections.get(connectionId);
    try {
      connection.destroy()
    } catch(ex) {}

    this.inServerConnections.delete(connectionId);
  }

  private onInPortServerConnected = (socket: Socket) => {
    this.idleInServerConnections.push(socket);
    socket.on('end', ());
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

  private onInServer;

  private onInServerDataTransfer = (data: any) => {
    // TODO
    // 트래픽 측정하는 로직 추가
  };

  private onInServerError = () => {
    console.log('onInServerError');
  };

  public getInPort() {
    return this.tunnel.inPort;
  }

  public getOutPort() {
    return this.tunnel.outPort;
  }

  public getTunnel() {
    return this.tunnel;
  }
}

export default ProxyServer;
