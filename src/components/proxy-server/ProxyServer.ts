import { ProxyServerService } from './proxy-server.service';
import { Tunnel } from '../tunnel/types/Tunnel';
import { createServer, Server, Socket } from 'net';

export default class ProxyServer {
  // constructor(
  //   private readonly tunnel: Tunnel,
  //   private readonly proxyServerService: ProxyServerService,
  // ) {}
  //
  // private inPortServer?: Server;
  // private outPortServer?: Server;
  //
  // private inServerConnectionId = 0;
  // private inServerConnections: Map<number, Socket> = new Map<number, Socket>();
  // private isAuthenticated = false;
  //
  // async bootstrap(): Promise<void> {
  //   this.inPortServer = createServer(this.onInServerConnected);
  //   this.outPortServer = createServer(this.onOutServerConnected);
  //
  //   return new Promise<void>((resolve, reject) => {
  //     try {
  //       this.inPortServer.listen(this.getInPort(), () => {
  //         this.outPortServer.listen(this.getOutPort(), () => {
  //           resolve();
  //         });
  //       });
  //     } catch (ex) {
  //       reject(ex);
  //     }
  //   });
  // }
  //
  // private onInServerConnected = (socket: Socket) => {
  //   setTimeout(() => {
  //     if (!this.isAuthenticated) {
  //       // 시간 내로 인증하지 못하면 소켓 폐기
  //       socket.destroy();
  //     }
  //   }, 5000);
  //
  //   socket.addListener('data', (data: any[]) => {
  //     const str = String(data);
  //
  //     try {
  //       const obj = JSON.parse(str);
  //
  //       if (
  //         obj.clientId === this.tunnel.clientId &&
  //         obj.clientSecret === this.tunnel.clientSecret
  //       ) {
  //         this.isAuthenticated = true;
  //         socket.removeAllListeners('data');
  //         socket.write('200');
  //
  //         const connectionId = ++this.inServerConnectionId;
  //         socket.on('data', this.onInServerDataTransfer);
  //         socket.on('error', this.onInServerError);
  //         socket.on('end', () => this.onInServerDisconnected(connectionId));
  //         this.inServerConnections.set(connectionId, socket);
  //       } else {
  //         socket.write('402');
  //       }
  //     } catch (ex) {
  //       socket.write('500');
  //     }
  //   });
  // };
  //
  // private onOutServerConnected = (socket: Socket) => {
  //   const iterator = this.inServerConnections.entries();
  //   const next = iterator.next();
  //
  //   if (next) {
  //     const inServerConnection = next.value as Socket;
  //     inServerConnection.pipe(socket);
  //     socket.pipe(inServerConnection);
  //   } else {
  //     socket.destroy();
  //   }
  // };
  //
  // private onInServerDataTransfer = (data: any[]) => {
  //   this.proxyServerService
  //     .onPacketTransferred(this.tunnel, data.length)
  //     .then();
  // };
  //
  // private onInServerError = (err: Error) => {
  //   this.proxyServerService.onProxyServerError(this.tunnel, err).then();
  // };
  //
  // private onInServerDisconnected = (connectionId: number) => {
  //   const connection = this.inServerConnections.get(connectionId);
  //   try {
  //     connection.destroy();
  //   } catch (ex) {}
  //
  //   this.inServerConnections.delete(connectionId);
  // };
  //
  // public getInPort() {
  //   return this.tunnel.inPort;
  // }
  //
  // public getOutPort() {
  //   return this.tunnel.outPort;
  // }
  //
  // public getIdleConnectionCount() {
  //   return this.inServerConnections.size;
  // }
  //
  // public getTunnel() {
  //   return this.tunnel;
  // }
}
