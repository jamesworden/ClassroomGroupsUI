import { effect, Injectable, signal } from "@angular/core";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

enum MessageType {
  ClassroomUpdated = 'ClassroomUpdated',
}

@Injectable({
  providedIn: 'root',
})
export class ClassroomsWebsocketService {
  private readonly _isConnectedToServer = signal(false);

  private hubConnection: HubConnection = new HubConnectionBuilder()
    .withUrl(`https://localhost:7192/classroom-groups`)
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
        console.log('Connected to server.');
        this._isConnectedToServer.set(true);
      },
      () => {
        console.error('Unable to connect to server.');
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
    this.hubConnection.on(MessageType.ClassroomUpdated, () => {
      // TODO
    });
  }
}
