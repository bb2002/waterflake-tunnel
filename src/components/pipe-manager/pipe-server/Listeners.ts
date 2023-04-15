import { Socket } from 'net';

export interface Listeners {
  onConnected(socket: Socket): Promise<void>;
  onDataReceived(data: any[]): void;
  onError(err: Error): void;
}
