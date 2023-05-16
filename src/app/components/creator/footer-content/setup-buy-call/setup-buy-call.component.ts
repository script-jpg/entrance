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
export class SetupBuyCallComponent {

  

  constructor(private router: Router, 
    private callQueueService: CallQueueService) { }

  cost: number = perMinCost;
  minutes: number = 1;


  pitch(event: any) {
    this.cost = event.value * perMinCost;
    this.minutes = event.value;
  }

  onConfirmBuyCall() {
    // this.router.navigate(['call/1']);
    console.log('Sending buy call request');
    this.callQueueService.buyCall("abc","user1", this.cost, this.minutes);
  }

}
