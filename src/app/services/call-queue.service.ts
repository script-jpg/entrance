import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CallQueueService {

  constructor(private http: HttpClient) { }

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
  

  public buyCall(creator_id: string, price: number, length: number): void {
    const data = {
      "creator_id": creator_id,
      "user_id": localStorage.getItem('user_id'),
      "price": price,
      "length_in_minutes": length
    }
    
    this.postData(environment.buyCallLink, data).subscribe(this.postDataObserver);
    
  }

  public endCall(creator_id: string): void {
    const data = {
      "creator_id": creator_id,
      "user_id": localStorage.getItem('user_id')
    }

    this.postData(environment.endCallLink, data).subscribe(this.postDataObserver);
    
  }

  public endStream(creator_id: string): void {
    const data = {
      "creator_id": creator_id
    }
    
    this.postData(environment.endStreamLink, data).subscribe(this.postDataObserver);
    
  }

  public setCreatorOnline(creator_id: string): void {
    const data = {
      "creator_id": creator_id
    }
    
    this.postData(environment.setCreatorOnlineLink, data).subscribe(this.postDataObserver);
    
  }


}
