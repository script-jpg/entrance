import { Injectable } from '@angular/core';

import { RxStomp } from '@stomp/rx-stomp';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  readonly rxStomp: RxStomp;
  constructor() { 
    this.rxStomp = new RxStomp();
    const user_id = localStorage.getItem('user_id');

    if (user_id === null) {
      return;
    }

    console.log("user_id: " + user_id + " from WebsocketService");

    this.rxStomp.configure({
      brokerURL: 'wss://4o15cnzf6e.execute-api.us-east-2.amazonaws.com/production',
      connectHeaders: {
        login: 'guest',
        passcode: 'guest'
      },
      heartbeatIncoming: 0,
      heartbeatOutgoing: 20000,
      reconnectDelay: 30000,
      debug: (msg: string): void => {
        console.log(new Date(), msg);
      }
    });

    this.rxStomp.activate();
  }

  
}
