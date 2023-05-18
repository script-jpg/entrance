import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {

  @Input() call_time: number; // Input for time to call the function in milliseconds
  @Input() functionToCall: (...args: any[]) => void; // Input for function to call
  @Input() functionArgs: any[] = []; // Arguments to be passed to the function
  countdown: number;
  subscription: Subscription;

  ngOnInit(): void {
    this.countdown = this.call_time / 1000; // Countdown in seconds

    this.subscription = interval(1000).pipe(take(this.countdown)).subscribe((val) => {
      this.countdown--;
      if (this.countdown === 0) {
        this.functionToCall(...this.functionArgs);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}