import { Component } from '@angular/core';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  subscription: Subscription;
  buyCallActive: boolean = false;
  isHoverOnFooter: boolean = false;
  isLoggedIn: boolean = false;

  constructor(private uiService: UiService) {
    this.subscription = this.uiService.onToggle().subscribe((value) => {
      this.buyCallActive = value;
    });
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
