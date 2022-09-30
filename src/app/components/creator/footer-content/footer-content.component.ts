import { Component, OnInit, Input, Optional } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';
import { NbDialogService, NbDialogRef } from '@nebular/theme';
import { AuthModalComponent } from '../../auth-modal/auth-modal.component';
import { GoogleApiService, UserInfo } from 'src/app/services/google-api.service';

@Component({
  selector: 'app-footer-content',
  templateUrl: './footer-content.component.html',
  styleUrls: ['./footer-content.component.scss']
})
export class FooterContentComponent implements OnInit {

  height: string = window.innerHeight*0.25+"px";
  buyCallActive: boolean = false;
  subscription: Subscription;
  @Input() isHoveringOnFooter: boolean = false;
  isLoggedIn: boolean = false;
  isSigningIn: boolean = false;

  constructor(private uiService: UiService, 
    private dialogService: NbDialogService,

    googleApi: GoogleApiService) {
    this.subscription = this.uiService
      .onToggle()
      .subscribe((value) => {this.buyCallActive = value;});
    
    // update isLoggedIn when userProfile is recieved
    googleApi.userProfileSubject.subscribe((userProfile) => {
      this.isLoggedIn = userProfile.info != null;
      console.log("isLoggedIn: " + this.isLoggedIn);
    });
  }





  ngOnInit(): void {

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

