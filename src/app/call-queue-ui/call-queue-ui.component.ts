import { Component, OnInit } from '@angular/core';
import { CallQueueService } from '../services/call-queue.service';

@Component({
  selector: 'app-call-queue-ui',
  templateUrl: './call-queue-ui.component.html',
  styleUrls: ['./call-queue-ui.component.scss']
})
export class CallQueueUiComponent implements OnInit {

  callQueue: any[] = [{"user_id":"user4","price_per_minute":30,"aggregate_call_length":1,"rank":1},{"user_id":"user1","price_per_minute":30,"aggregate_call_length":2,"rank":2},{"user_id":"user3","price_per_minute":25,"aggregate_call_length":3,"rank":3}];

  sliderValue: number = 50; // default value

  your_user_id = "user1"

  constructor(private callQueueService: CallQueueService) { }

  ngOnInit(): void {
    this.callQueueService.getCallQueue().subscribe((callQueue) => {
      console.log("Call queue recieved: " + JSON.stringify(callQueue));
      this.callQueue = callQueue;
    });
  }

  formatTime(minutes: number): string {
    let hours = Math.floor(minutes / 60);
    let remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`;
  }

  resubmitPPM() {
    this.callQueueService.buyCall("abc","user1", this.sliderValue, 1);
    
  }

}
