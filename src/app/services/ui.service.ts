import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private buyCallActive: boolean = false;
  private subject = new Subject<any>();

  toggleSetupBuyCall(): void {
    this.buyCallActive = !this.buyCallActive;
    this.subject.next(this.buyCallActive);
  }
  constructor() { 
   
  }

  onToggle(): Observable<any> {
    return this.subject.asObservable();
  }
}
