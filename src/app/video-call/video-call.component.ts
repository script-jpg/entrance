import { Component, OnInit } from '@angular/core';
import { NbIconModule } from '@nebular/theme';
import { webSocket } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ElementRef, ViewChild } from '@angular/core';



const subject = webSocket(environment.wsLink);
let myPeerConnection: any;



@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  providers: [NbIconModule]
})
export class VideoCallComponent implements OnInit {
  remoteSrc: any;
  localSrc: any;
  @ViewChild('remoteVideo') remoteVideo: ElementRef;
  

  getRemoteSrc() {
    return this.remoteSrc;
  }

  getLocalSrc() {
    return this.localSrc;
  }

  getRemoteVideo() {
    return this.remoteVideo;
  }

  hangUpCall() {
    closeVideoCall();
    sendToServer({
      name: myUsername,
      target: targetUsername,
      type: "hang-up",
    });
    this.router.navigate(['']);
    console.log("Call ended");
  }
  

  constructor(private route: ActivatedRoute, private router: Router) { 
    myPeerConnection = new RTCPeerConnection({
      iceServers: [
        // Information about ICE servers - Use your own!
        {
          urls: ['stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',]
        },
      ],
      iceCandidatePoolSize: 10,
    });

    this.remoteVideo = new ElementRef(null);
    
  }

  handleTrackEvent(event) {
    console.log("handleTrackEvent: "+ event);
    this.remoteVideo.nativeElement!.srcObject = event.streams[0];
  }

  handleVideoAnswerMsg(msg) {
    console.log("handleVideoAnswerMsg: ", msg)
    const desc = new RTCSessionDescription(msg.sdp);
    myPeerConnection.setRemoteDescription(desc).catch(reportError);
  
  }

  handleNewICECandidateMsg(msg) {
    const candidate = new RTCIceCandidate(msg.candidate);
  
    myPeerConnection!.addIceCandidate(candidate).catch(reportError);
  }
  

  ngOnInit(): void {

    console.log(
      "Hello from VideoCallComponent constructor"
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
      console.log('message type: ' + value['msgType']);
      if (value['msgType'] === "video-offer") {
        this.handleVideoOfferMsg(value);
      } else if (value['msgType'] === "video-answer") {
        this.handleVideoAnswerMsg(value);
      } else if (value['msgType'] === "new-ice-candidate") {
        this.handleNewICECandidateMsg(value);
      } else if (value['msgType'] === "hang-up") {
        closeVideoCall();
      }
    });
    // Note that at least one consumer has to subscribe to the created subject - otherwise "nexted" values will be just buffered and not sent,
    // since no connection was established!

    subject.next({ action: "updateUserInfo", user_id: user_id });
    console.log("Sent updateUserInfo message to server")
    // This will send a message to the server once a connection is made. Remember value is serialized with JSON.stringify by default!

    // subject.complete(); // Closes the connection.


    let isInviter: boolean = this.route.snapshot.paramMap.get('isInviter') === '1';
    console.log("isInviter: " + isInviter);
    if (isInviter) {
      console.log("Inviting to call...");
      this.invite();
    }
  }

  createPeerConnection() {
    console.log("myPeerConnection "+myPeerConnection);
  
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.ontrack = this.handleTrackEvent;
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    myPeerConnection.removeTrack = handleRemoveTrackEvent;
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
  }

  invite() {
    this.createPeerConnection();
  
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((localStream) => {
        // document.getElementById("local_video").srcObject = localStream;
        localStream
          .getTracks()
          .forEach((track) => myPeerConnection.addTrack(track, localStream));
      })
      .catch(this.handleGetUserMediaError);
  }
  
  handleGetUserMediaError(e) {
    switch (e.name) {
      case "NotFoundError":
        alert(
          "Unable to open your call because no camera and/or microphone" +
            "were found."
        );
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert(`Error opening your camera and/or microphone: ${e.message}`);
        break;
    }
  
    closeVideoCall();
  }



  mute() {
    console.log("Muted");
  }

  handleVideoOfferMsg(msg) {
    let localStream;
  
    targetUsername = msg.sender_id;
    this.createPeerConnection();
    console.log("handleVideoOfferMsg: ")
  
    const desc = new RTCSessionDescription(msg.sdp);
  
    myPeerConnection!
      .setRemoteDescription(desc)
      .then(() => navigator.mediaDevices.getUserMedia(mediaConstraints))
      .then((stream) => {
        localStream = stream;
        // document.getElementById("local_video").srcObject = localStream;
  
        localStream
          .getTracks()
          .forEach((track) => myPeerConnection.addTrack(track, localStream));
      })
      .then(() => myPeerConnection!.createAnswer())
      .then((answer) => myPeerConnection!.setLocalDescription(answer))
      .then(() => {
        const msg = {
          name: myUsername,
          target: targetUsername,
          type: "video-answer",
          sdp: myPeerConnection!.localDescription,
        };
  
        sendToServer(msg);
      })
      .catch(this.handleGetUserMediaError);
  }
    
  
}

function sendToServer(obj: any): void {
  console.log("Sending to server: " + JSON.stringify(obj, null, 4));
  let pack = {   "action": "sendMessage",   "msgType": obj.type,  "user_id": obj.target };
  if (obj.type === "video-offer") {
    pack["msg"] = obj.sdp;
  } else if (obj.type === "video-answer") {
    pack["msg"] = obj.sdp;
  } else if (obj.type === "new-ice-candidate") {
    pack["msg"] = obj.candidate;
  } else if (obj.type === "hang-up") {
    pack["msg"] = "hang-up";
  }

  pack["sender_id"] = myUsername;

  subject.next(pack);
}



let myUsername = localStorage.getItem('user_id');

let targetUsername: string | null = localStorage.getItem('creator_id') // change this


const mediaConstraints = {
  audio: true, // We want an audio track
  video: true, // And we want a video track
};





function handleNegotiationNeededEvent() {
  console.log(myPeerConnection);

  console.log("handleNegotiationNeededEvent");
  myPeerConnection
  .createOffer()
  .then((offer) => myPeerConnection.setLocalDescription(offer))
  .then(() => {
    sendToServer({
      name: myUsername,
      target: targetUsername,
      type: "video-offer",
      sdp: myPeerConnection!.localDescription,
    });
  })
  .catch(reportError);

}




function handleICECandidateEvent(event) {
  if (event.candidate) {
    sendToServer({
      type: "new-ice-candidate",
      target: targetUsername,
      candidate: event.candidate,
    });
  }
}




function handleRemoveTrackEvent(event) {
  const stream = event.streams[0];
  const trackList = stream.getTracks();

  if (trackList.length === 0) {
    closeVideoCall();
  }
}






function closeVideoCall() {
  const remoteVideo = (VideoCallComponent as any).getRemoteVideo();
  const localVideo = (VideoCallComponent as any).localSrc;

  if (myPeerConnection) {
    myPeerConnection.ontrack = null;
    // myPeerConnection.removeTrack = null;
    // myPeerConnection.onremovestream = null;
    myPeerConnection.onicecandidate = null;
    myPeerConnection.oniceconnectionstatechange = null;
    myPeerConnection.onsignalingstatechange = null;
    myPeerConnection.onicegatheringstatechange = null;
    myPeerConnection.onnegotiationneeded = null;

    if (remoteVideo.srcObject) {
      remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
    }

    if (localVideo.srcObject) {
      localVideo.srcObject.getTracks().forEach((track) => track.stop());
    }

    myPeerConnection.close();
    // myPeerConnection = null;
  }

  // remoteVideo.removeAttribute("src");
  // remoteVideo.removeAttribute("srcObject");
  // localVideo.removeAttribute("src");
  // remoteVideo.removeAttribute("srcObject");

  // document.getElementById("hangup-button").disabled = true;
  // targetUsername = null;
}

function handleICEConnectionStateChangeEvent(event) {
  switch (myPeerConnection!.iceConnectionState) {
    case "closed":
    case "failed":
      closeVideoCall();
      break;
  }
}

function handleSignalingStateChangeEvent(event) {
  switch (myPeerConnection!.signalingState) {
    case "closed":
      closeVideoCall();
      break;
  }
}

function handleICEGatheringStateChangeEvent(event) {
  // Our sample just logs information to console here,
  // but you can do whatever you need.
}

