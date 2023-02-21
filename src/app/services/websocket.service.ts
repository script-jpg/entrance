import { Injectable } from '@angular/core';

import { webSocket } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';

const subject = webSocket(environment.wsLink);

@Injectable({
  providedIn: 'root'
})


export class WebsocketService {
  
  constructor() { 

    console.log(
      "Hello from WebsocketService constructor"
    )
    
    const user_id = localStorage.getItem('user_id');
    if (user_id == null) {
      console.log("user_id is null");
      return;
    }

    subject.subscribe((value: any) => {
      // console.log('message received: ' + value['msg']);
      // console.log('message from ' + value['sender_id'])
      console.log(value);

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
     });
    // Note that at least one consumer has to subscribe to the created subject - otherwise "nexted" values will be just buffered and not sent,
    // since no connection was established!

    subject.next({ action: "updateUserInfo", user_id: user_id });
    console.log("Sent updateUserInfo message to server")
    // This will send a message to the server once a connection is made. Remember value is serialized with JSON.stringify by default!

    // subject.complete(); // Closes the connection.
  }
}

/* From https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Signaling_and_video_calling */





