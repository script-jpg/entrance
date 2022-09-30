import { Component, OnInit } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GraphqlService, User } from '../services/graphql.service';
import { GoogleApiService } from '../services/google-api.service';
import { NbDialogService, NbDialogConfig } from '@nebular/theme';
import { OnboardModalComponent } from '../components/onboard-modal/onboard-modal.component';
import { ActivatedRoute } from '@angular/router';
import {ParamMap} from '@angular/router';
import { switchMap } from 'rxjs/operators';

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


  

  ngOnInit(): void {
    const creator_id = this.route.snapshot.paramMap.get('creator_id');
    if (creator_id != null) {
      this.creator_id = creator_id
      localStorage.setItem("creator_id", creator_id);
    }

    console.log("creator_id: " + this.creator_id);


    if (this.creator_id) {
      this.graphql.queryUser(this.creator_id,  this.graphql.getStreamerData());
    }
    
    
  }

  constructor(
    private uiService: UiService, 
    googleApi: GoogleApiService, 
    private graphql: GraphqlService,
    private dialogService: NbDialogService,
    private route: ActivatedRoute) {
      
    // nbDialogConfig: NbDialogConfig) {
      // nbDialogConfig.closeOnBackdropClick = false;

      this.googleApi = googleApi;
      googleApi.authenticate("app");
      googleApi.userProfileSubject.subscribe((userProfile) => {
        const user_id = userProfile.info.sub;
        console.log("user_id: " + user_id);
        this.graphql.getIsNewUser().subscribe((isNewUser) => {
          if (isNewUser) {
            this.open(true);
          }
        });
        this.graphql.queryUser(user_id,  graphql.getUserData());
    });
    
    console.log("hi");
    this.subscription = this.uiService.onToggle().subscribe((value) => {
      this.buyCallActive = value;
    });
    
  }

  protected open(closeOnEsc: boolean) {
    this.dialogService.open(OnboardModalComponent, { closeOnEsc })

  }


  setIsHoverOnFooter(): void {
    this.isHoverOnFooter = true;
    console.log("isHoverOnFooter: " + this.isHoverOnFooter);
  }

  setNotHoverOnFooter(): void {
    this.isHoverOnFooter = false;
    console.log("isHoverOnFooter: " + this.isHoverOnFooter);
  }

}
