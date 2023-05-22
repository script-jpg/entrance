import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WebsocketService } from './websocket.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class CallQueueService {

  confirmedCall: Subject<boolean> = new Subject<boolean>();

  callQueue: Subject<any> = new Subject<any>();

  public getCallQueue(): Observable<any> {
    return this.callQueue.asObservable();
  }

  public getConfirmedCall(): Observable<boolean> {
    return this.confirmedCall.asObservable();
  }

  constructor(
    private http: HttpClient, 
    private webSocketService: WebsocketService,
    private router: Router) {
    this.webSocketService.connect();

    this.webSocketService.getMessages().subscribe(msg => {
      console.log("Received message: " + JSON.stringify(msg));
      if (msg.msgType == "call_start") {
        console.log("Received call_start message");
        // wait 3 seconds for tesing purposes

        // setTimeout(() => {
        //   console.log('Now ending call for testing purposes')
        //   this.webSocketService.sendMessage({"action":"endCall","user_id":"user1","creator_id":"abc","cooldown_time":5});
        // }, 2000);
        router.navigate(['call/1']);
      } else if (msg.msgType=="updateQueuePosition") {
        console.log("Received updateQueuePosition message");

        // send queue position to subject 
        this.callQueue.next(msg.call_queue);

      }
    });
    
  }

  ngOnInit(): void {
    
  }

  postDataObserver = {
    next: (response) => {
      console.log('Success:', response);
    },
    error: (error) => {
      console.error('Error:', error);
    },
    complete: () => {
      console.log('Request completed');
    },
  };

  postData(url: string, data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    // Replace <API_KEY> with your AWS API Gateway API Key if required
    // headers = headers.set('x-api-key', '<API_KEY>');
  
    return this.http.post(url, data, { headers });
  }
  

  public buyCall(creator_id: string, user_id: string, price: number, length: number): void {
    this.confirmedCall.next(true);
    const data = {"action":"buyCall","user_id":user_id,"creator_id":creator_id,"price":price,"length_in_minutes":length}

    // this.webSocketService.connect();
    
    // this.postData(environment.buyCallLink, data).subscribe(this.postDataObserver);
    this.webSocketService.sendMessage(data);
    
  }

  public endCall(creator_id: string): void {
    const data = {
      "action": "endCall",
      "creator_id": creator_id,
      // "user_id": localStorage.getItem('user_id')
      "user_id":"user1"
    }

    this.webSocketService.sendMessage(data);
    
  }

  public endStream(creator_id: string): void {
    const data = {
      "creator_id": creator_id
    }
    
    this.webSocketService.sendMessage(data);
    
  }

  public setCreatorOnline(creator_id: string): void {
    const data = {
      "creator_id": creator_id
    }
    
    this.postData(environment.setCreatorOnlineLink, data).subscribe(this.postDataObserver);
    
  }


}
