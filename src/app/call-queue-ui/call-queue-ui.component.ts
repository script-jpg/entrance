import { Component, OnInit } from '@angular/core';
import { CallQueueService } from '../services/call-queue.service';

@Component({
  selector: 'app-call-queue-ui',
  templateUrl: './call-queue-ui.component.html',
  styleUrls: ['./call-queue-ui.component.scss']
})
export class CallQueueUiComponent implements OnInit {

  callQueue: any[] = [];

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
    console.log("resubmitting ppm");
    console.log("creator_id: "+localStorage.getItem("creator_id"));
    console.log("user_id: "+localStorage.getItem("user_id"));
    this.callQueueService.buyCall(localStorage.getItem("creator_id"),localStorage.getItem("user_id"), this.sliderValue, 1);
    
  }

}
