import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GraphqlService{
  http: HttpClient;

  constructor(http: HttpClient) { 
    this.http = http;
  }

  async isNewUser(user_id: string): Promise<boolean> {
    let isNewUser: boolean = false;
    await this.isNewUserQuery(user_id).then((res) => {
      isNewUser = res.data.user_by_id.values.length === 0;
    });
    console.log("isNewUser: " + isNewUser + " in graphql.service.ts");
    const myPromise = new Promise<boolean>((resolve) => {
      resolve(isNewUser);
    });
    return myPromise;
  }

  async isNewUserQuery(user_id: string) {
    const body: any = `query oneUser {
      user_by_id(value: { user_id: "${user_id}" }) {
        values {
            username,
            email,
        }
      }
    }`
    const headers = { 
      'Content-Type': 'application/graphql', 
      'x-cassandra-token': 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJsYmJUcDRObzdfUHBJLUxOWFZJbUFmY1pWQWs3TFNwdnY5Z0RFVF80M2ZrIn0.eyJqdGkiOiI4NmU3YmJmYy1iNjU5LTQxMGMtOTljMy04ODg1NGY2ZDRmZjEiLCJleHAiOjE2NjQzNTczMjAsIm5iZiI6MCwiaWF0IjoxNjY0MzIxMzIwLCJpc3MiOiJodHRwczovL2F1dGguY2xvdWQuZGF0YXN0YXguY29tL2F1dGgvcmVhbG1zL0Nsb3VkVXNlcnMiLCJhdWQiOiJhdXRoLXByb3h5Iiwic3ViIjoiY2VjYzdmOTEtZjhmNi00NDNkLWFjMTktY2RjMGUyZDZhN2U5IiwidHlwIjoiSUQiLCJhenAiOiJhdXRoLXByb3h5IiwiYXV0aF90aW1lIjoxNjY0MzIxMzIwLCJzZXNzaW9uX3N0YXRlIjoiNTJiZTkyZDUtODk1MS00N2M1LWI4MGYtMjM0MzkxYzYxNjFmIiwiYWNyIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwibmFtZSI6ImF1ZG9ib3QgbXVzaWMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhdWRvYm90bXVzaWNhQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJhdWRvYm90IiwiZmFtaWx5X25hbWUiOiJtdXNpYyIsImVtYWlsIjoiYXVkb2JvdG11c2ljYUBnbWFpbC5jb20ifQ.BomkryYqT6v00UfPjCu6Ddd-XwQYSWOMtbez34bz0whUWRYx7cYBQWsDon1KCpw0TQqrdK7PgjDa5Ja5us_52JoKOjA-XlO2jQLZ1kl_AN4T6I8sT5Z5M_Kqo40LfL4NsCCAnVRVLbHeo8fSp90awrq805bq_uL5nYCksTWZAbEVAz3Rx1kkZzQVidRe_wNPSs5RJCJhfmUPHXuMTcMh7Oec7bfBrZUhhoQEMjMLteMTCZVDEKTHCeprW5z6EzIYLovemt27jejn9AvZrnaCKtKAIvCVKuIljhvbRWcTC4AXYB7Pl2MgTWeSyN8g6zowLKRnb64XOBWw9MkCxj5WGg',
      'Accept': '*/*',
    };
    var res = this.http.post<any>('https://8cdfec44-3da0-4276-878b-298c404593d0-us-east1.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    return await lastValueFrom(res);
  }
  


}
