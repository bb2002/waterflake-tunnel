import { createServer, Server, Socket } from 'net';

export class TCPServer {
  private constructor(private readonly rawServer: Server) {}

  static createServer(connectionListener: (socket: Socket) => void) {
    const rawServer: Server = createServer(connectionListener);
    return new TCPServer(rawServer);
  }

  listen(port: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.rawServer.listen(port, () => {
        resolve();
      });
    });
  }

  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.rawServer.close((error: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
