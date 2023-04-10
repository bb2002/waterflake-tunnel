import { ProxyServerService } from './proxy-server.service';
import { Tunnel } from '../tunnel/types/Tunnel';
import { createServer, Server, Socket } from 'net';

export default class ProxyServer {
  constructor(
    private readonly tunnel: Tunnel,
    private readonly proxyServerService: ProxyServerService,
  ) {}

  private inPortServer?: Server;
  private outPortServer?: Server;

  private inServerConnectionId = 0;
  private inServerConnections: Map<number, Socket> = new Map<number, Socket>();

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
    socket.on('end', () => this.onInServerDisconnected(connectionId));
    this.inServerConnections.set(connectionId, socket);
  };

  private onOutServerConnected = (socket: Socket) => {
    const iterator = this.inServerConnections.entries();
    const next = iterator.next();

    if (next) {
      const inServerConnection = next.value as Socket;
      inServerConnection.pipe(socket);
      socket.pipe(inServerConnection);
    } else {
      socket.destroy();
    }
  };

  private onInServerDataTransfer = (data: any[]) => {
    this.proxyServerService
      .onPacketTransferred(this.tunnel, data.length)
      .then();
  };

  private onInServerError = (err: Error) => {
    this.proxyServerService.onProxyServerError(this.tunnel, err).then();
  };

  private onInServerDisconnected = (connectionId: number) => {
    const connection = this.inServerConnections.get(connectionId);
    try {
      connection.destroy();
    } catch (ex) {}

    this.inServerConnections.delete(connectionId);
  };

  public getInPort() {
    return this.tunnel.inPort;
  }

  public getOutPort() {
    return this.tunnel.outPort;
  }

  public getIdleConnectionCount() {
    return this.inServerConnections.size;
  }

  public getTunnel() {
    return this.tunnel;
  }
}
