import { Component, OnInit, Input } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';

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

  constructor(private uiService: UiService) {
    this.subscription = this.uiService
      .onToggle()
      .subscribe((value) => {this.buyCallActive = value;});
  }



  ngOnInit(): void {

  }

  onBuyCall() {
    this.uiService.toggleSetupBuyCall();
    
  }

  onLogin() {
    console.log("onLogin Called!");
  }

}
