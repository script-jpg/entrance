import { Injectable } from '@angular/core';

import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Message } from '../types/message';
import { Subject, Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})


export class WebsocketService {
  private user_id: string = localStorage.getItem('user_id');
  private socket$: WebSocketSubject<Message>;
  private messagesSubject: Subject<Message> = new Subject<Message>();

  getMessages(): Observable<Message> {
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
          console.log(msg);
          this.messagesSubject.next(msg);
        }
      );
    }
  }

  sendMessage(message: Message): void {
    console.log('Sending message of type: ' + message.msgType)
    this.socket$.next(message);
  }

  public getNewWebSocket(): WebSocketSubject<Message> {
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
    })

  

}

/* From https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling */

      // if (value['action'] === "sendMessage") {
      //   if (value['msgType'] === "video-offer") {
      //     handleVideoOfferMsg(value);
      //   } else if (value['msgType'] === "video-answer") {
      //     handleVideoAnswerMsg(value);
      //   } else if (value['msgType'] === "new-ice-candidate") {
      //     handleNewICECandidateMsg(value);
      //   } else if (value['msgType'] === "hang-up") {
      //     closeVideoCall();
      //   }
      // }

}

