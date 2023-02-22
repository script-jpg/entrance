import { Component, OnInit } from '@angular/core';
import { NbIconModule } from '@nebular/theme';
import { webSocket } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ElementRef, ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Message } from '../types/message';

export const ENV_RTCPeerConfiguration = environment.RTCPeerConfiguration;

const mediaConstraints = {
  audio: true,
  video: true
  // video: {width: 1280, height: 720} // 16:9
  // video: {width: 960, height: 540}  // 16:9
  // video: {width: 640, height: 480}  //  4:3
  // video: {width: 160, height: 120}  //  4:3
};

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};



@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  providers: [NbIconModule]
})
export class VideoCallComponent implements AfterViewInit {
  targetUser: string = localStorage.getItem('creator_id');
  sender_id: string = localStorage.getItem('user_id');
  muteInnerHTML: string = 'Mute';
  

  @ViewChild('local_video') localVideo: ElementRef;
  @ViewChild('received_video') remoteVideo: ElementRef;

  private peerConnection: RTCPeerConnection;

  private localStream: MediaStream = null;

  inCall = false;
  localVideoActive = false;


  constructor(private dataService: WebsocketService, private route: ActivatedRoute) { }

  async call(): Promise<void> {
    this.createPeerConnection();

    // Add the tracks from the local stream to the RTCPeerConnection
    this.localStream.getTracks().forEach(
      track => this.peerConnection.addTrack(track, this.localStream)
    );

    try {
      const offer: RTCSessionDescriptionInit = await this.peerConnection.createOffer(offerOptions);
      // Establish the offer as the local peer's current description.
      await this.peerConnection.setLocalDescription(offer);

      this.inCall = true;

      this.dataService.sendMessage({msgType: 'offer', msg: offer, sender_id: this.sender_id, user_id: this.targetUser, action: 'sendMessage'});
    } catch (err) {
      this.handleGetUserMediaError(err);
    }
  }

  hangUp(): void {
    this.dataService.sendMessage({msgType: 'hangup', msg: '', sender_id: this.sender_id, user_id: this.targetUser, action: 'sendMessage'});
    this.closeVideoCall();
  }

  ngAfterViewInit(): void {
    this.addIncominMessageHandler();
    this.requestMediaDevices().then(() => {
      this.startLocalVideo();
      if (this.route.snapshot.params['isInviter'] === '1') { //disallow calls if creator is not streaming
        console.log('isInviter is true')
        this.call();
      }
    });
  }

  private addIncominMessageHandler(): void {
    this.dataService.connect();

    // this.transactions$.subscribe();
    this.dataService.getMessages().subscribe((msg: Message) => {
      switch (msg.msgType) {
        case 'offer':
          this.handleOfferMessage(msg.msg, msg.sender_id);
          break;
        case 'answer':
          this.handleAnswerMessage(msg.msg);
          break;
        case 'hangup':
          this.handleHangupMessage(msg);
          break;
        case 'ice-candidate':
          this.handleICECandidateMessage(msg.msg);
          break;
        default:
          console.log('unknown message of type ' + msg.msgType);
      }
    });
  }

  /* ########################  MESSAGE HANDLER  ################################## */

  private handleOfferMessage(msg: RTCSessionDescriptionInit, sender_id): void {
    console.log('handle incoming offer');
    console.log('sender of offer is or user_id: '+sender_id)
    console.log('the current user is: '+this.sender_id)
    if (!this.peerConnection) {
      this.createPeerConnection();
    }

    if (!this.localStream) {
      
      this.startLocalVideo();
    }

    this.peerConnection.setRemoteDescription(new RTCSessionDescription(msg))
      .then(() => {

        // add media stream to local video
        this.localVideo.nativeElement.srcObject = this.localStream;

        // add media tracks to remote connection
        this.localStream.getTracks().forEach(
          track => {
            try {
              this.peerConnection.addTrack(track, this.localStream);
            } catch (e) {
              console.error(e);
            }
          }
        );

      }).then(() => {

      // Build SDP for answer message
      return this.peerConnection.createAnswer();

    }).then((answer) => {

      // Set local SDP
      return this.peerConnection.setLocalDescription(answer);

    }).then(() => {

      // Send local SDP to remote party
      this.dataService.sendMessage({msgType: 'answer', msg: this.peerConnection.localDescription, sender_id: this.sender_id, user_id: sender_id, action: 'sendMessage'});

      this.inCall = true;

    }).catch(this.handleGetUserMediaError);
  }

  private handleAnswerMessage(msg: RTCSessionDescriptionInit): void {
    console.log('handle incoming answer');
    this.peerConnection.setRemoteDescription(msg);
  }

  private handleHangupMessage(msg: Message): void {
    console.log(msg);
    this.closeVideoCall();
  }

  private handleICECandidateMessage(msg: RTCIceCandidate): void {
    const candidate = new RTCIceCandidate(msg);
    this.peerConnection.addIceCandidate(candidate).catch(this.reportError);
  }

  private async requestMediaDevices(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      // pause all tracks
      this.pauseLocalVideo();
    } catch (e) {
      console.error(e);
      alert(`getUserMedia() error: ${e.name}`);
    }
  }

  startLocalVideo(): void {
    console.log('starting local stream');
    this.localStream.getTracks().forEach(track => {
      track.enabled = true;
    });
    this.localVideo.nativeElement.srcObject = this.localStream;

    this.localVideoActive = true;
  }

  pauseLocalVideo(): void {
    console.log('pause local stream');
    this.localStream.getTracks().forEach(track => {
      track.enabled = false;
    });
    this.localVideo.nativeElement.srcObject = undefined;

    this.localVideoActive = false;
  }

  private createPeerConnection(): void {
    console.log('creating PeerConnection...');
    this.peerConnection = new RTCPeerConnection(ENV_RTCPeerConfiguration);

    this.peerConnection.onicecandidate = this.handleICECandidateEvent;
    this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
    this.peerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
    this.peerConnection.ontrack = this.handleTrackEvent;
  }

  private closeVideoCall(): void {
    console.log('Closing call');

    if (this.peerConnection) {
      console.log('--> Closing the peer connection');

      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;

      // Stop all transceivers on the connection
      this.peerConnection.getTransceivers().forEach(transceiver => {
        transceiver.stop();
      });

      // Close the peer connection
      this.peerConnection.close();
      this.peerConnection = null;

      this.inCall = false;
    }
  }

  /* ########################  ERROR HANDLER  ################################## */
  private handleGetUserMediaError(e: Error): void {
    switch (e.name) {
      case 'NotFoundError':
        alert('Unable to open your call because no camera and/or microphone were found.');
        break;
      case 'SecurityError':
      case 'PermissionDeniedError':
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        console.log(e);
        alert('Error opening your camera and/or microphone: ' + e.message);
        break;
    }

    this.closeVideoCall();
  }

  private reportError = (e: Error) => {
    console.log('got Error: ' + e.name);
    console.log(e);
  }

  /* ########################  EVENT HANDLER  ################################## */
  private handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    console.log(event);
    if (event.candidate) {
      this.dataService.sendMessage({
        msgType: 'ice-candidate',
        msg: event.candidate,
        sender_id: this.sender_id,
        user_id: this.targetUser,
        action: 'sendMessage'
      });
    }
  }

  private handleICEConnectionStateChangeEvent = (event: Event) => {
    console.log(event);
    switch (this.peerConnection.iceConnectionState) {
      case 'closed':
      case 'failed':
      case 'disconnected':
        this.closeVideoCall();
        break;
    }
  }

  private handleSignalingStateChangeEvent = (event: Event) => {
    console.log(event);
    switch (this.peerConnection.signalingState) {
      case 'closed':
        this.closeVideoCall();
        break;
    }
  }

  private handleTrackEvent = (event: RTCTrackEvent) => {
    console.log('handle track event');
    console.log(event);
    this.remoteVideo.nativeElement.srcObject = event.streams[0];
  }

  mute(): void {
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      this.muteInnerHTML = track.enabled ? 'Mute' : 'Unmute';
    });
  }
}


