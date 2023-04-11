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
        socket.write(errMsg, () => {
          socket.destroy();
        });
      });
  };

  private onOutServerConnected = (socket: Socket) => {};

  private onInServerDataTransfer = (data: any[]) => {};

  private onOutServerDataTransfer = (data: any[]) => {};

  private onServerError = (error: Error) => {};

  private onInServerDisconnected = (connectionId: number) => {};

  public get inPort() {
    return this.tunnel.inPort;
  }

  public get outPort() {
    return this.tunnel.outPort;
  }
}
