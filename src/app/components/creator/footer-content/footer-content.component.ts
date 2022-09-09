import { Component, OnInit } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer-content',
  templateUrl: './footer-content.component.html',
  styleUrls: ['./footer-content.component.scss']
})
export class FooterContentComponent implements OnInit {

  width: string = window.innerWidth/2+"px";
  height: string = window.innerHeight*0.25+"px";
  buyCallActive: boolean = false;
  subscription: Subscription;
  

  constructor(private uiService: UiService) {
    this.subscription = this.uiService
      .onToggle()
      .subscribe((value) => {this.buyCallActive = value;});
  }


  ngOnInit(): void {
    console.log("width: " + this.width);

  }

  onBuyCall() {
    this.uiService.toggleSetupBuyCall();
    
  }

}
