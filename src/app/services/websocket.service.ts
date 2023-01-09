import { Injectable } from '@angular/core';

import { webSocket } from 'rxjs/webSocket';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  constructor() { 
    
    const user_id = localStorage.getItem('user_id');
    if (user_id == null) {
      console.log("user_id is null");
      return;
    }

    const wsLink: string = 'wss://4o15cnzf6e.execute-api.us-east-2.amazonaws.com/production';

    const subject = webSocket(wsLink);

    subject.subscribe((value: any) => {
      console.log('message received: ' + value['msg'])
     });
    // Note that at least one consumer has to subscribe to the created subject - otherwise "nexted" values will be just buffered and not sent,
    // since no connection was established!

    subject.next({ action: "updateUserInfo", user_id: user_id });
    // This will send a message to the server once a connection is made. Remember value is serialized with JSON.stringify by default!

    // subject.complete(); // Closes the connection.
  }

  
}
