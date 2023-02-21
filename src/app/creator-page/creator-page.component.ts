import { Component, OnInit } from '@angular/core';
import { UiService } from '../services/ui.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GraphqlService, StreamerSettings, User } from '../services/graphql.service';
import { GoogleApiService } from '../services/google-api.service';
import { NbDialogService, NbDialogConfig } from '@nebular/theme';
import { OnboardModalComponent } from '../components/onboard-modal/onboard-modal.component';
import { ActivatedRoute } from '@angular/router';
import {ParamMap} from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { WebsocketService } from '../services/websocket.service';

@Component({
  selector: 'app-creator-page',
  templateUrl: './creator-page.component.html',
  styleUrls: ['./creator-page.component.scss']
})
export class CreatorPageComponent implements OnInit {

  subscription: Subscription;
  buyCallActive: boolean = false;
  isHoverOnFooter: boolean = false;
  googleApi: GoogleApiService;
  creator_id: string = "";
  streamerSettings: StreamerSettings | null = null;

  getPlayerSrc(): string {
    let platform_id: string = "";
    if (this.streamerSettings != null) {
      platform_id = this.streamerSettings.platform_id;
    }
    return "https://player.twitch.tv/?channel="+platform_id+"&parent=localhost";
  }
  

  ngOnInit(): void {
    const creator_id = this.route.snapshot.paramMap.get('creator_id');
    if (creator_id != null) {
      this.creator_id = creator_id
      localStorage.setItem("creator_id", creator_id);
    }

    console.log("creator_id: " + this.creator_id);
    this.graphqlService.getStreamerSettings().subscribe((value) => {
      console.log("Streamer Settings: ")
      console.log(value);
      this.streamerSettings = value;
    })

    


    if (this.creator_id) {
      this.graphqlService.queryUser(this.creator_id,  this.graphqlService.getStreamerData());
      this.graphqlService.queryStreamerSettings(this.creator_id);
    }
    
    
  }

  constructor(
    private uiService: UiService, 
    googleApi: GoogleApiService, 
    private graphqlService: GraphqlService,
    private dialogService: NbDialogService,
    private route: ActivatedRoute) {
      
    // nbDialogConfig: NbDialogConfig) {
      // nbDialogConfig.closeOnBackdropClick = false;

      this.googleApi = googleApi;
      googleApi.authenticate("app");
      googleApi.userProfileSubject.subscribe((userProfile) => {
        const user_id = userProfile.info.sub;
        console.log("user_id: " + user_id);
        this.graphqlService.getIsNewUser().subscribe((isNewUser) => {
          if (isNewUser) {
            this.open();

          }
        });
        this.graphqlService.queryUser(user_id,  graphqlService.getUserData());
    });
    
    this.subscription = this.uiService.onToggle().subscribe((value) => {
      this.buyCallActive = value;
    });
    
  }

  protected open() {
    this.dialogService.open(OnboardModalComponent, { closeOnBackdropClick:false })

  }


  setIsHoverOnFooter(): void {
    this.isHoverOnFooter = true;
    // console.log("isHoverOnFooter: " + this.isHoverOnFooter);
  }

  setNotHoverOnFooter(): void {
    this.isHoverOnFooter = false;
    // console.log("isHoverOnFooter: " + this.isHoverOnFooter);
  }

}
