import { Injectable, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from 'environments/environment';

enum MessageType {
  LoadedClassrooms = 'LoadedClassrooms',
}

@Injectable({
  providedIn: 'root',
})
export class ClassroomsWebsocketService {
  private readonly _isConnectedToServer = signal(false);

  private hubConnection: HubConnection = new HubConnectionBuilder()
    .withUrl(environment.BASE_API)
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  constructor() {
    this.connectAndRegisterEvents();
    this.registerServerEvents();
  }

  private connectAndRegisterEvents() {
    this.hubConnection.start().then(
      () => {
        console.log('[Server] Connected.');
        this._isConnectedToServer.set(true);
      },
      () => {
        console.error('[Server] Failed to connect.');
        this._isConnectedToServer.set(false);
      }
    );
    this.hubConnection.onreconnecting(() => {
      this._isConnectedToServer.set(false);
    });
    this.hubConnection.onreconnected(() => {
      this._isConnectedToServer.set(true);
    });
  }

  private registerServerEvents(): void {
    this.hubConnection.on(MessageType.LoadedClassrooms, (classrooms) => {
      // this.classrooms.service.do-the-thing-to-add-these-classrooms-to-state
    });
  }
}
