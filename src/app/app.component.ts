import { Component, OnInit } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GraphqlService } from './services/graphql.service';
import { GoogleApiService } from './services/google-api.service';
import { NbDialogService, NbDialogConfig } from '@nebular/theme';
import { OnboardModalComponent } from './components/onboard-modal/onboard-modal.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  subscription: Subscription;
  buyCallActive: boolean = false;
  isHoverOnFooter: boolean = false;
  graphql: GraphqlService;
  googleApi: GoogleApiService;

  constructor(private uiService: UiService, graphql: GraphqlService, 
    googleApi: GoogleApiService, 
    private dialogService: NbDialogService) {
    // nbDialogConfig: NbDialogConfig) {
      // nbDialogConfig.closeOnBackdropClick = false;

      this.graphql = graphql;
      this.googleApi = googleApi;
      googleApi.authenticate("app");
      googleApi.userProfileSubject.subscribe((userProfile) => {
        const user_id = userProfile.info.sub;
        console.log("user_id: " + user_id);
        graphql.getIsNewUser().subscribe((isNewUser) => {
          if (isNewUser) {
            this.open(true);
          }
        });
        graphql.queryUser(user_id,  graphql.getUserData());
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

  title = 'entrance';
}
