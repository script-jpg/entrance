import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {

  @Input() time: number; // Input for time to call the function in milliseconds
  @Input() functionToCall: (...args: any[]) => void; // Input for function to call
  @Input() functionArgs: any[] = []; // Arguments to be passed to the function

  @Output() timeChange = new EventEmitter<number>(); // Output for time left
  countdown: number;
  subscription: Subscription;

  ngOnInit(): void {
    this.countdown = this.time / 1000; // Countdown in seconds

    this.subscription = interval(1000).pipe(take(this.countdown)).subscribe((val) => {
      this.countdown--;
      this.timeChange.emit(this.countdown);
      if (this.countdown === 0) {
        setTimeout(() => {
          this.functionToCall(...this.functionArgs);
        }, 1000);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}