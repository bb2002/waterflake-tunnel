import { Tunnel } from '../../tunnel/types/Tunnel';
import { Socket } from 'net';
import { TCPServer } from 'src/common/net-server/tcp-server';
import { Listeners } from './Listeners';

export default class PipeServer {
  private inServer: TCPServer;
  private outServer: TCPServer;
  private inServerConnections: Map<number, Socket> = new Map();
  private inServerConnectionId = 0;

  public constructor(private readonly tunnel: Tunnel) {}

  async startUp(listeners: Listeners): Promise<void> {
    this.inServer = TCPServer.createServer(this.onInServerConnected(listeners));
    this.outServer = TCPServer.createServer(this.onOutServerConnected);

    await this.inServer.listen(this.inPort);
    await this.outServer.listen(this.outPort);
  }

  async shutdown() {
    this.inServerConnections.forEach((socket: Socket, id: number) => {
      this.inServerConnections.delete(id);
      if (socket) {
        socket.destroy();
      }
    }, this);
    await this.inServer.close();
    await this.outServer.close();
  }

  private onInServerConnected =
    (listeners: Listeners) => async (socket: Socket) => {
      try {
        await listeners.onConnected(socket);

        const connectionId = this.createConnectionId();
        this.inServerConnections.set(connectionId, socket);
        socket.on('data', listeners.onDataReceived);
        socket.on('error', listeners.onError);
        socket.on('end', () => this.onInServerDisconnected(connectionId));
      } catch (errMsg) {
        socket.write(errMsg?.message ?? 'Unknown Error', () => {
          socket.destroy();
        });
      }
    };

  private createConnectionId() {
    this.inServerConnectionId += 1;
    return this.inServerConnectionId;
  }

  private onOutServerConnected = (socket: Socket) => {
    const inServerSocket = this.getInServerSocket();
    if (!inServerSocket) {
      // 유휴 커넥션이 없는 경우 소켓 폐기
      socket.destroy();
      return;
    }

    // 커넥션 연결
    inServerSocket.pipe(socket);
    socket.pipe(inServerSocket);
  };

  private getInServerSocket(): Socket | null {
    if (!this.isConnectionExist()) return null;

    const connectionId = this.getConnectionId();
    const inServerSocket = this.inServerConnections.get(connectionId);
    this.inServerConnections.delete(connectionId);

    return inServerSocket;
  }

  private isConnectionExist() {
    const keys = [...this.inServerConnections.keys()];
    return keys.length === 0;
  }

  private getConnectionId() {
    // 유휴 커넥션 중 하나를 선택
    return [...this.inServerConnections.keys()][0];
  }

  private onInServerDisconnected = (connectionId: number) => {
    try {
      const socket = this.inServerConnections.get(connectionId);
      if (socket) {
        socket.destroy();
      }
      this.inServerConnections.delete(connectionId);
    } catch (ex) {}
  };

  public get inPort() {
    return this.tunnel.inPort;
  }

  public get outPort() {
    return this.tunnel.outPort;
  }

  public get getTunnel() {
    return this.tunnel;
  }

  public get idleInServerConnectionCount() {
    return this.inServerConnections.size;
  }
}
