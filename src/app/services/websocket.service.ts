import { Injectable } from '@angular/core';

import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Subject, Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})


export class WebsocketService {
  // private user_id: string = localStorage.getItem('user_id');
  private user_id: string = localStorage.getItem('user_id');
  private socket$: WebSocketSubject<any>;
  private messagesSubject: Subject<any> = new Subject<any>();

  getMessages(): Observable<any> {
    return this.messagesSubject.asObservable();
  }

  constructor() {
  }

  public connect(): void {

    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket();

      this.socket$.next({ action: "updateUserInfo", user_id: this.user_id, msg: "", msgType: "", sender_id: "" });
      console.log("Sent updateUserInfo message to server")

      this.socket$.subscribe(
        // Called whenever there is a message from the server
        msg => {
          console.log('Received message of type: ' + msg.msgType);
          this.messagesSubject.next(msg);
        }
      );
    }
  }

  sendMessage(message: any): void {
    console.log('Sending message of type: ' + message.msgType)
    this.socket$.next(message);
  }

  public getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url: environment.wsLink,
      openObserver: {
        next: () => {
          console.log('Connected to websocket');
        }
      },
      closeObserver: {
        next: () => {
          console.log('Disconnected from websocket');
          this.connect();
        }
      }
    })}

}

