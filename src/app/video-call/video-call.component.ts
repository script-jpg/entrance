import { Component, NgZone, OnInit } from '@angular/core';
import { NbIconModule } from '@nebular/theme';
import { webSocket } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ElementRef, ViewChild } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { Message } from '../types/message';
import { User, GraphqlService } from '../services/graphql.service';
import { BehaviorSubject } from 'rxjs';
import { CallQueueService } from '../services/call-queue.service';
import {GlobalDataService} from "../services/global-data.service";

export const ENV_RTCPeerConfiguration = environment.RTCPeerConfiguration;

const mediaConstraints = {
  audio: true,
  video: false
  // video: {width: 1280, height: 720} // 16:9
  // video: {width: 960, height: 540}  // 16:9
  // video: {width: 640, height: 480}  //  4:3
  // video: {width: 160, height: 120}  //  4:3
};

let senders = [];

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
};

let webcamActive = false;
let screenShareActive = false;
let webcamTrack;
const onEndedChange = new BehaviorSubject(0);




@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  providers: [NbIconModule]
})
export class VideoCallComponent implements AfterViewInit, OnInit {
  targetUser: string = localStorage.getItem('creator_id');
  sender_id: string = localStorage.getItem('user_id');
  muteHTML: boolean = false;
  loadingCamera: boolean = false;

  userData: User | null = null;


  get isWebCamActive(): boolean {
    return webcamActive;
  }

  get isScreenShareActive(): boolean {
    return screenShareActive;
  }

  get screenShareDisabled(): boolean {
    return webcamActive || screenShareActive;
  }


  @ViewChild('local_video') localVideo: ElementRef;
  @ViewChild('received_video') remoteVideo: ElementRef;
  @ViewChild('muteButton') muteButton: ElementRef;

  private peerConnection: RTCPeerConnection;

  private localStream: MediaStream = null;
  private videoStream: MediaStream = null;

  isInviter: boolean = false;

  remainingTime: number;

  isLocalVideoActive(): boolean {
    return webcamActive || screenShareActive;
  }

  user_profile_pic = localStorage.getItem('user_profile_pic');
  remote_profile_pic: string = '';


  inCall = false;

  remoteVideoActive = false;
  call_time: number = 0;

  constructor(
    private dataService: WebsocketService,
    private route: ActivatedRoute,
    private router: Router,
    private graphql: GraphqlService,
    private callQueueService: CallQueueService,
    private globalDataService: GlobalDataService) { }



  ngOnInit(): void {
    this.call_time = this.globalDataService.getGlobalDataByKey('call_time');
    this.user_profile_pic = localStorage.getItem('user_profile_pic');
    this.remote_profile_pic = localStorage.getItem('streamer_profile_pic');


    // We subscribe to the getUserData() subject so that we can get information about the caller
    // if we are the streamer
    this.graphql.getUserData().subscribe((user: any) => {
      console.log("Recieved user-data:");
      console.log(user);
      this.remote_profile_pic = user.profile_pic;
    });



    // we subscribe to onended change so we can call this.pauseLocalVideo() when the value is changed
    onEndedChange.subscribe((val: any) => {
      // use this if so that we don't pause local video initially
      // see https://www.learnrxjs.io/learn-rxjs/subjects/behaviorsubject
      console.log('onEndedChange recieved')
      const shareScreenTrack = this.localStream.getVideoTracks()[0]
      this.localStream.removeTrack(shareScreenTrack);
      this.localStream.addTrack(webcamTrack);
      if (val) this.pauseLocalVideo();
      console.log('ScreenShareDisabled: ',this.screenShareDisabled);


      // Works but ugly... fixes problem button status are not updated
      this.muteButton.nativeElement.click();
      this.muteButton.nativeElement.click();
      // see if this refreshes the context
      // it does but not a great solution
    });
  }

  ngAfterViewInit(): void {

    // set remote profile pic
    if (this.isInviter) this.remote_profile_pic = localStorage.getItem('streamer_profile_pic');

    this.isInviter = this.route.snapshot.params['isInviter'] === '1';
    console.log('isInviter is: '+this.isInviter)
    this.dataService.connect();
    this.addIncominMessageHandler();
    this.requestMediaDevices().then(() => {
      // this.startWebcam();
      this.startLocalAudio();


      if (this.isInviter) { //disallow calls if creator is not streaming
        console.log('isInviter is true')

        this.dataService.sendMessage({msgType: 'send-user-data', msg: '', sender_id: this.sender_id, user_id: this.targetUser, action: 'sendMessage'});
        // viewer is calling creator
        this.createPeerConnection();
        this.call();
      }
    });
  }

  async call(): Promise<void> {

    console.log("in Call: ")
    console.log(this.localStream.getTracks());



    // Add the tracks from the local stream to the RTCPeerConnection
    this.localStream.getTracks().forEach(
      track => {
        try {
          this.peerConnection.addTrack(track, this.localStream)
        } catch (err) {
          console.log(err);
        }

      }
    );

    try {
      const offer: RTCSessionDescriptionInit = await this.peerConnection.createOffer(offerOptions);
      // Establish the offer as the local peer's current description.
      await this.peerConnection.setLocalDescription(offer);

      senders = this.peerConnection.getSenders();

      this.inCall = true;

      this.dataService.sendMessage({msgType: 'offer', msg: offer, sender_id: this.sender_id, user_id: this.targetUser, action: 'sendMessage'});
    } catch (err) {
      this.handleGetUserMediaError(err);
    }
  }

  hangUp(): void {
    console.log('hangup called');
    this.dataService.sendMessage({msgType: 'hangup', msg: '', sender_id: this.sender_id, user_id: this.targetUser, action: 'sendMessage'});
    this.closeVideoCall();
    //go back to the creator page of the last creator you were on
    this.router.navigate(['user/'+this.targetUser]);
  }

  // addIncominMessageHandler()
  // Handles incoming messages based on their msgType
  // in each case, it calls a handler in this file
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
        case 'pause-video':
          this.handlePauseVideoMessage(msg);
          break;
        case 'resume-video':
          this.handleResumeVideoMessage(msg);
          break;
        case 'send-user-data':
          this.handleUserDataMessage(msg);
          break;
        default:
          console.log('unknown message of type ' + msg.msgType);
      }
    });
  }

  endCallFromApi(): void {
    if (this.sender_id) {
      this.callQueueService.endCall(this.sender_id, this.targetUser)
      this.hangUp();

    }

  }

  /* ########################  MESSAGE HANDLER  ################################## */

  private handleUserDataMessage(msg: Message): void {
    console.log('handle user data message');
    console.log(msg);

    console.log("Querying for user data...")

    // get user data
    this.graphql.queryUser(msg.sender_id, this.graphql.getUserData());
  }

  private handleOfferMessage(msg: RTCSessionDescriptionInit, sender_id): void {
    console.log('handle incoming offer');
    console.log('sender of offer is or user_id: '+sender_id)
    console.log('the current user is: '+this.sender_id)
    if (sender_id != undefined) this.targetUser = sender_id;
    if (!this.peerConnection) {
      this.createPeerConnection();
    }

    if (!this.localStream) {

      this.startWebcam();
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
      this.dataService.sendMessage({msgType: 'answer', msg: this.peerConnection.localDescription, sender_id: this.sender_id, user_id: this.targetUser, action: 'sendMessage'});

      this.inCall = true;
      senders = this.peerConnection.getSenders();

    }).catch(this.handleGetUserMediaError);
  }

  private handleAnswerMessage(msg: RTCSessionDescriptionInit): void {
    console.log('handle incoming answer');
    this.peerConnection.setRemoteDescription(msg);
  }

  private handleHangupMessage(msg: Message): void {
    console.log(msg);
    this.closeVideoCall();
    console.log("isInviter: "+this.isInviter)
    if (this.isInviter) {
      // if the creator is the one who hung up, the user is redirected to their stream page
      console.log('navigating back to creator page');
      this.router.navigate(['user/'+this.targetUser]);
    } else {
      // the creator stays on their stream page after a user has hung up
      this.remoteVideo.nativeElement.srcObject = null;
    }
  }

  private handleICECandidateMessage(msg: RTCIceCandidate): void {
    const candidate = new RTCIceCandidate(msg);
    this.peerConnection.addIceCandidate(candidate).catch(this.reportError);
  }

  private async requestMediaDevices(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      setTimeout(() => {
        this.loadingCamera = false;
      }, 1);
    } catch (e) {
      console.error(e);
      alert(`getUserMedia() error: ${e.name}`);
    }
  }

  startLocalAudio(): void {
    console.log('starting local stream');
    this.localStream.getTracks().forEach(track => {
      if (track.kind === 'audio') {
        track.enabled = true;
      }
    });
  }

  async webcamHandler(): Promise<void> {
    if (webcamActive) {
      this.pauseLocalVideo();
      this.localStream.getTracks().forEach(track => {
        if (track.kind === 'video') {
          track.stop();
        }
      });
    } else {
      this.loadingCamera = true;
      mediaConstraints.video = true;
      await this.requestMediaDevices();
      this.startWebcam();
    }
  }

  startWebcam(): void {
    console.log('starting local stream');
    console.log('showing tracks')
    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = true;

    });
    this.localVideo.nativeElement.srcObject = this.localStream;

    this.dataService.sendMessage({msgType: 'resume-video', msg: null, sender_id: this.sender_id, user_id: this.targetUser, action: 'sendMessage'});

    webcamActive = true;
  }

  videoTrack: MediaStreamTrack;

  async requestScreenShare(): Promise<void> {
    try {
      webcamTrack = this.localStream.getVideoTracks()[0];
      await navigator.mediaDevices.getDisplayMedia().then(stream => {
        // get the screen track
        let videoTrack = stream.getVideoTracks()[0];
        var sender = senders.find(function (s) {
          return s.track.kind == videoTrack.kind;
        });
        sender.replaceTrack(videoTrack);

        // replace local video source

        this.localStream.removeTrack(webcamTrack);
        videoTrack.enabled = true;
        this.localStream.addTrack(videoTrack);

        this.localVideo.nativeElement.srcObject = this.localStream;

        screenShareActive = true;

        this.dataService.sendMessage({msgType: 'resume-video', msg: null, sender_id: this.sender_id, user_id: this.targetUser, action: 'sendMessage'});

        videoTrack.onended = function () {
          // Problem: we do not have access to this.* class functions in this block
          // we need a way of alerting our class to call a class function on this onended event
          // Crude Solution: Use a BehaviourSubject from Rxjs and just subscribe to it in oninit (please change if you have a more elegant/better solution)

          onEndedChange.next(1);

          // re-use the old video stream track after screen sharing track has ended
          sender.replaceTrack(webcamTrack);
        }
      });
    } catch (e) {
      console.error(e);
      screenShareActive = false;
      // alert(`getDisplayMedia() error: ${e.name}`);
    }

  }

  async startScreenShare(): Promise<void> {
    // replace video track with screen share
    try {
      await this.requestScreenShare();


      // add audio track to local stream

      console.log('showing tracks' + this.localStream.getTracks());

      // this.handleNegotiationNeededEvent();
      // this.startLocalAudio();
    } catch (e) {
      console.error(e);
      alert(`getDisplayMedia() error: ${e.name}`);
    }


  }

  screenShareHandler(): void {
    if (screenShareActive) {
      this.pauseLocalVideo();
    } else {
      this.startScreenShare();
    }
  }

  // pauseLocalVideo()
  // sets webcamActive and screenShareActive to false
  // sends a websocket message to the other user so that they set their remoteVideoActive to false
  pauseLocalVideo(): void {
    console.log('pause local stream');
    this.localStream.getTracks().forEach(track => {
      if (track.kind === 'video') track.enabled = false;
    });
    this.localVideo.nativeElement.srcObject = undefined;

    this.dataService.sendMessage({msgType: 'pause-video', msg: null, sender_id: this.sender_id, user_id: this.targetUser, action: 'sendMessage'});

    webcamActive = false;
    screenShareActive = false;
  }

  private handleResumeVideoMessage(msg: Message): void {
    console.log('handle resume video message from: '+msg.sender_id);
    this.remoteVideoActive = true;
  }

  private handlePauseVideoMessage(msg: Message): void {
    console.log('handle pause video message from: '+msg.sender_id);
    this.remoteVideoActive = false;
  }

  private createPeerConnection(): void {
    console.log('creating PeerConnection...');
    this.peerConnection = new RTCPeerConnection(ENV_RTCPeerConfiguration);

    this.peerConnection.onicecandidate = this.handleICECandidateEvent;
    this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
    this.peerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
    this.peerConnection.ontrack = this.handleTrackEvent;
    this.peerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;
  }

  private async handleNegotiationNeededEvent() {
    this.call();
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
        console.log("Disconnected from handleICEConnectionStateChangeEvent")

        // if the creator is the one who hung up, the user is redirected to their stream page
        this.router.navigate(['user/'+this.targetUser]);
        break;
    }
  }

  private handleSignalingStateChangeEvent = (event: Event) => {
    console.log(event);
    switch (this.peerConnection.signalingState) {
      case 'closed':
        this.closeVideoCall();
        console.log("Closed from handleSignalingStateChangeEvent");
        break;
    }
  }

  readonly src: MediaStream[] = [];

  private handleTrackEvent = (event: RTCTrackEvent) => {
    console.log('handle track event');
    console.log(event);
    this.remoteVideo.nativeElement.srcObject = event.streams[0];
  }


  mute(): void {
    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      this.muteHTML = !track.enabled;
    });
  }
}


