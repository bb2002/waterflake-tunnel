import { PipeManagerService } from '../pipe-manager.service';
import { Tunnel } from '../../tunnel/types/Tunnel';
import { createServer, Server, Socket } from 'net';

export default class PipeServer {
  private inServer?: Server;
  private outServer?: Server;
  private inServerConnections: Map<number, Socket> = new Map();
  private inServerConnectionId = 0;

  public constructor(
    private readonly tunnel: Tunnel,
    private readonly pipeManagerService: PipeManagerService,
  ) {}

  async startUp(): Promise<void> {
    this.inServer = createServer(this.onInServerConnected);
    this.outServer = createServer(this.onOutServerConnected);

    return new Promise<void>((resolve, reject) => {
      try {
        this.inServer.listen(this.inPort, () => {
          this.outServer.listen(this.outPort, () => {
            resolve();
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  async shutdown() {}

  private onInServerConnected = (socket: Socket) => {
    this.pipeManagerService
      .authenticate(this.tunnel, socket)
      .then(() => {
        const connectionId = ++this.inServerConnectionId;
        this.inServerConnections.set(connectionId, socket);
        socket.on('data', this.onInServerDataTransfer);
        socket.on('error', this.onServerError);
        socket.on('end', () => this.onInServerDisconnected(connectionId));
      })
      .catch((errMsg) => {
        socket.write(errMsg?.message ?? 'Unknown Error', () => {
          socket.destroy();
        });
      });
  };

  private onOutServerConnected = (socket: Socket) => {
    const keys = [...this.inServerConnections.keys()];
    if (keys.length === 0) {
      // 유휴 커넥션이 없는 경우 소켓 폐기
      socket.destroy();
      return;
    }

    // 유휴 커넥션 중 하나를 선택
    const connectionId = keys[0];
    const inServerSocket = this.inServerConnections.get(connectionId);
    this.inServerConnections.delete(connectionId);
    if (!inServerSocket) {
      socket.destroy();
      return;
    }

    // 커넥션 연결
    inServerSocket.pipe(socket);
    socket.pipe(inServerSocket);
  };

  private onInServerDataTransfer = (data: any[]) => {
    // 전송된 데이터 크기를 기록
    this.pipeManagerService.appendTransferredPacketSize(
      this.tunnel._id,
      data.length,
    );
  };

  private onServerError = (error: Error) => {
    this.pipeManagerService.loggingSocketError(error);
  };

  private onInServerDisconnected = (connectionId: number) => {
    try {
      const socket = this.inServerConnections.get(connectionId);
      if (socket) {
        socket.destroy();
      }
      this.inServerConnections.delete(connectionId);
    } catch(ex) {}
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
