import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CallQueueService } from 'src/app/services/call-queue.service';
import { WebsocketService } from 'src/app/services/websocket.service';

const perMinCost: number = 30;
@Component({
  selector: 'app-setup-buy-call',
  templateUrl: './setup-buy-call.component.html',
  styleUrls: ['./setup-buy-call.component.scss']
})
export class SetupBuyCallComponent implements OnInit {

  constructor(private router: Router, 
    private callQueueService: CallQueueService,
    private webSocketService: WebsocketService) { }

  ngOnInit(): void {
  }

  cost: number = perMinCost;
  minutes: number = 1;


  pitch(event: any) {
    this.cost = event.value * perMinCost;
    this.minutes = event.value;
  }

  onConfirmBuyCall() {
    // this.router.navigate(['call/1']);
    console.log('Sending buy call request');
    this.callQueueService.buyCall(localStorage.getItem('creator_id'), this.cost, this.minutes);
    this.webSocketService.getMessages().subscribe(msg => {
      if (msg.msgType == "call_start") {
        console.log("Received call_start message");

        console.log('Now ending call for testing purposes')
        this.callQueueService.endCall(localStorage.getItem('creator_id'));
      }
    });

  }

}
