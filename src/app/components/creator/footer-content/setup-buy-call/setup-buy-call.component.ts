import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { CallQueueService } from 'src/app/services/call-queue.service';
import { GraphqlService } from 'src/app/services/graphql.service';
import { WebsocketService } from 'src/app/services/websocket.service';


@Component({
  selector: 'app-setup-buy-call',
  templateUrl: './setup-buy-call.component.html',
  styleUrls: ['./setup-buy-call.component.scss']
})
export class SetupBuyCallComponent implements OnInit {

  perMinCost: number = 30;

  constructor(private router: Router, 
    private callQueueService: CallQueueService, private graphqlService: GraphqlService) { }

  ngOnInit(): void {
    this.graphqlService.getStreamerSettings().subscribe((value) => {
      console.log("Streamer Settings: ")
      console.log(value);
      this.perMinCost = value['price_per_minute']
      console.log('perMinCost: '+this.perMinCost);
      this.cost = this.perMinCost;
    });

    this.graphqlService.queryStreamerSettings(localStorage.getItem("creator_id"));
  }


  cost: number;
  minutes: number = 1;


  pitch(event: any) {
    this.cost = event.value * this.perMinCost;
    this.minutes = event.value;
  }

  onConfirmBuyCall() {
    // this.router.navigate(['call/1']);
    console.log('Sending buy call request');
    console.log("creator_id: "+localStorage.getItem("creator_id"));
    console.log("user_id: "+localStorage.getItem("user_id"));
    this.callQueueService.buyCall(localStorage.getItem("creator_id"),localStorage.getItem("user_id"), this.cost, this.minutes);
  }

}
