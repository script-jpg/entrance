import { Component, OnInit, Input, Optional } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { AuthModalComponent } from '../../auth-modal/auth-modal.component';
import { GoogleApiService, UserInfo } from 'src/app/services/google-api.service';
import { GraphqlService, User } from 'src/app/services/graphql.service';
import { CallQueueService } from 'src/app/services/call-queue.service';

@Component({
  selector: 'app-footer-content',
  templateUrl: './footer-content.component.html',
  styleUrls: ['./footer-content.component.scss']
})
export class FooterContentComponent implements OnInit {
  @Input() creator_id: string = "";

  height: string = window.innerHeight*0.25+"px";
  buyCallActive: boolean = false;
  subscription: Subscription;
  @Input() isHoveringOnFooter: boolean = false;
  isLoggedIn: boolean = false;
  isSigningIn: boolean = false;

  streamerData: User | null = null;
  callConfirmed: boolean = true;

  ngOnInit(): void {

    this.graphql.getStreamerData().subscribe((streamerData) => {
      this.streamerData = streamerData;
      console.log("streamerData: " + JSON.stringify(streamerData));
      localStorage.setItem("streamer_profile_pic", streamerData.profile_pic);
    });

    this.callQueueService.getConfirmedCall().subscribe((callConfirmed) => {
      this.callConfirmed = callConfirmed;
    });

  }

  constructor(private uiService: UiService, 
    private dialogService: NbDialogService,
    googleApi: GoogleApiService,
    private graphql: GraphqlService,
    private callQueueService: CallQueueService) {
      localStorage.setItem("creator_id",this.creator_id);

      
    this.subscription = this.uiService
      .onToggle()
      .subscribe((value) => {this.buyCallActive = value;});
    
    // update isLoggedIn when userProfile is recieved
    googleApi.userProfileSubject.subscribe((userProfile) => {
      this.isLoggedIn = userProfile.info != null;
      console.log("isLoggedIn: " + this.isLoggedIn);
    });
  }





  

  onBuyCall() {
    this.uiService.toggleSetupBuyCall();
    
  }

  protected open(closeOnEsc: boolean) {
    this.dialogService.open(AuthModalComponent, { closeOnEsc }).onClose.subscribe(() => this.isSigningIn = false);
  }

  onLogin() {
    this.isSigningIn = true;
    this.open(true);
  }
    
}

