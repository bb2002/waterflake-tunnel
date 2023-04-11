import { Injectable } from '@nestjs/common';
import { Tunnel } from '../tunnel/types/Tunnel';
import { Socket } from 'net';

@Injectable()
export class PipeManagerService {
  async authenticate(tunnel: Tunnel, socket: Socket) {
    return new Promise<void>((resolve, reject) => {
      const handler = setTimeout(() => {
        reject(new Error('Login time out.'));
      }, 3000);

      socket.addListener('data', (data: any[]) => {
        try {
          const auth = JSON.parse(String(data));
          if (!auth?.clientId || !auth?.clientSecret) {
            reject(new Error('Authentication data not found.'));
            return;
          }

          const { clientId, clientSecret } = auth;
          if (
            clientId === tunnel.clientId &&
            clientSecret === tunnel.clientSecret
          ) {
            clearTimeout(handler);
            socket.removeAllListeners();
            resolve();
          } else {
            reject(new Error('Authentication failed.'));
          }
        } catch (ex) {}
      });
    });
  }
}
