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
      'x-cassandra-token': 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJsYmJUcDRObzdfUHBJLUxOWFZJbUFmY1pWQWs3TFNwdnY5Z0RFVF80M2ZrIn0.eyJqdGkiOiI2YzU1YmJkZS05YjdkLTRkMzMtYTgyYS04ZTAyMWFlOGEzZGIiLCJleHAiOjE2NjM2MzcxMDUsIm5iZiI6MCwiaWF0IjoxNjYzNjAxMTA1LCJpc3MiOiJodHRwczovL2F1dGguY2xvdWQuZGF0YXN0YXguY29tL2F1dGgvcmVhbG1zL0Nsb3VkVXNlcnMiLCJhdWQiOiJhdXRoLXByb3h5Iiwic3ViIjoiY2VjYzdmOTEtZjhmNi00NDNkLWFjMTktY2RjMGUyZDZhN2U5IiwidHlwIjoiSUQiLCJhenAiOiJhdXRoLXByb3h5IiwiYXV0aF90aW1lIjoxNjYzNjAxMTA1LCJzZXNzaW9uX3N0YXRlIjoiMTNhYWQ2MmItODJlMy00ODNiLTlmZjAtM2E3ZmZlZWUwNzQyIiwiYWNyIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwibmFtZSI6ImF1ZG9ib3QgbXVzaWMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhdWRvYm90bXVzaWNhQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJhdWRvYm90IiwiZmFtaWx5X25hbWUiOiJtdXNpYyIsImVtYWlsIjoiYXVkb2JvdG11c2ljYUBnbWFpbC5jb20ifQ.mQ1as-3Us6no68buc7mF8bKKpojFYzneMHOHnDbThsC4rnfD-8m8b98XRFyJBTsM_FeftUpNnmsTNI5HaBSsE2BDQaLi1W9MK8stLBLwwTu40JekobsiX-v4nX7bB0XwGaDJBPA_I48RFp-EVJQ4tnConj1wexrsT5E_7U20_Fxt2PIgrk-dCVL2eVExctj8HKHZEA0UUmPNRcct3G5Uyvmx6Ds55BxiX1_kXPYBuS6QPpfkRZw0RHajCmgvRwxRcQbC1SgzxWWcgshwcvUBq8LfyHPIE1HkpS0SbVinkcEJpU2emDqvhlXFJ4xF3EBcrBT5E-YfRl_zi87soyEB5g',
      'Accept': '*/*',
    };
    var res = this.http.post<any>('https://8cdfec44-3da0-4276-878b-298c404593d0-us-east1.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    return await lastValueFrom(res);
  }
  


}
