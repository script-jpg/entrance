import { Component, OnInit, Input, Optional } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';
import { NbDialogRef, NbDialogService } from '@nebular/theme';
import { AuthModalComponent } from '../../auth-modal/auth-modal.component';

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

  constructor(private uiService: UiService, 
    private dialogService: NbDialogService,
    @Optional() private nbdialogRef: NbDialogRef<AuthModalComponent>) {
    this.subscription = this.uiService
      .onToggle()
      .subscribe((value) => {this.buyCallActive = value;});
  }



  ngOnInit(): void {

  }

  onBuyCall() {
    this.uiService.toggleSetupBuyCall();
    
  }

  protected open(closeOnEsc: boolean) {
    this.dialogService.open(AuthModalComponent, { closeOnEsc }).onClose.subscribe(() => this.isHoveringOnFooter = false);
    setTimeout(() => {
      this.isHoveringOnFooter = true;
    }, 10);

  }

  onLogin() {
    this.open(true);
  }
    
}

