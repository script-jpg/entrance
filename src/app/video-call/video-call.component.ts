import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbIconModule } from '@nebular/theme';

@Component({
  selector: 'app-video-call',
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.scss'],
  providers: [NbIconModule]
})
export class VideoCallComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  endCall() {
    this.router.navigate(['']);
    console.log("Call ended");
  }

  mute() {
    console.log("Muted");
  }
}
