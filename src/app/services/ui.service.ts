import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private buyCallActive: boolean = false;
  private isHoveringOnFooter: boolean = false;
  private BuyCallSubject = new Subject<any>();
  private hoverSubject = new Subject<any>();

  toggleSetupBuyCall(): void {
    this.buyCallActive = !this.buyCallActive;
    this.BuyCallSubject.next(this.buyCallActive);
  }

  hoverOnFooter(): void {
    this.isHoveringOnFooter = !this.isHoveringOnFooter;
    //console.log("hovering on footer: " + this.isHoveringOnFooter);
    this.hoverSubject.next(this.isHoveringOnFooter);
  }


  constructor() { 
   
  }


  onToggle(): Observable<any> {
    return this.BuyCallSubject.asObservable();
  }

  onHoverFooter(): Observable<any> {
    return this.hoverSubject;
  }
}
