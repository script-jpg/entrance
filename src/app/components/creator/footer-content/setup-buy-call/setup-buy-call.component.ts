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

  confirmedCall: Subject<boolean> = new Subject<boolean>();

  callQueue: Subject<any> = new Subject<any>();

  constructor(private router: Router, 
    private webSocketService: WebsocketService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.webSocketService.connect();

    this.webSocketService.getMessages().subscribe(msg => {
      console.log("Received message: " + JSON.stringify(msg));
      if (msg.msgType == "call_start") {
        console.log("Received call_start message");
        // wait 3 seconds for tesing purposes

        setTimeout(() => {
          console.log('Now ending call for testing purposes')
          this.webSocketService.sendMessage({"action":"endCall","user_id":"user1","creator_id":"abc","cooldown_time":5});
        }, 2000);
      } else if (msg.msgType=="updateQueuePosition") {
        console.log("Received updateQueuePosition message");
        // wait 3 seconds for tesing purposes

        console.log("Queue position: " + JSON.stringify(msg.call_queue[0]))

        // send queue position to subject 
        this.callQueue.next(msg.call_queue);

      }
    });
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
    this.confirmedCall.next(true);


    this.webSocketService.sendMessage({"action":"buyCall","user_id":"user1","creator_id":"abc","price":"25","length_in_minutes":1});


  }

}
