import { Component, OnInit } from '@angular/core';
import { GoogleApiService } from 'src/app/services/google-api.service';
import {GraphqlService} from '../../../services/graphql.service';
import defaultPfp from '../../../default-img.json'
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { CallQueueService } from 'src/app/services/call-queue.service';

@Component({
  selector: 'app-header-content',
  templateUrl: './header-content.component.html',
  styleUrls: ['./header-content.component.scss']
})
export class HeaderContentComponent implements OnInit {

  profilePicSrc: string = defaultPfp.src;

  positions = NbGlobalPhysicalPosition;
  private index: number = 0;
  isStreamer: boolean = false;

  // showToast(position: any, status: any) {
  //   this.index += 1;
  //   this.toastrService.show(status || 'Success', `Toast ${this.index}`, { position, status });
  // }

  constructor(
    public googleApi: GoogleApiService, 
    graphqlService: GraphqlService,
    private router: Router,
    private callQueueService: CallQueueService
    ) {

      // this.showToast(this.positions.TOP_RIGHT, "Logged in")a;

      graphqlService.getUserData().subscribe((user) => {
        console.log("user: "+user);
        this.isStreamer = user.is_streamer;
        this.profilePicSrc = user.profile_pic;
        localStorage.setItem("user_profile_pic", user.profile_pic);
      });

  }

  ngOnInit(): void {
  }

  handleSelect(item: string): void {
    console.log(item);
    switch (item) {
      case "Log out":
        this.googleApi.signOut();
        break;
      default:
        break;
    }
  }

  startStream() {
    console.log("start stream");
    this.callQueueService.setCreatorOnline(localStorage.getItem('user_id'));
    // wait for 10 seconds
    // setTimeout(() => {
    //   this.router.navigate(['call/0']);
    // }, 15000);

  }

}
