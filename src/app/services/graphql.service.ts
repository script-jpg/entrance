import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, observable, Subject } from 'rxjs';


export interface User {
  user_id: string
  email: string,
  username: string,
  created: string,
  updated: string,
  is_streamer: boolean,
  profile_pic: File | undefined,
  version: number
}

@Injectable({
  providedIn: 'root'
})
export class GraphqlService{
  http: HttpClient;
  headers = { 
    'Content-Type': 'application/graphql', 
    'x-cassandra-token': 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJsYmJUcDRObzdfUHBJLUxOWFZJbUFmY1pWQWs3TFNwdnY5Z0RFVF80M2ZrIn0.eyJqdGkiOiIzMGExYzA2ZS1jNTAxLTRjYTctODhlMi01NWE5MTdlOTg0M2IiLCJleHAiOjE2NjQ0NTM0NzEsIm5iZiI6MCwiaWF0IjoxNjY0NDE3NDcxLCJpc3MiOiJodHRwczovL2F1dGguY2xvdWQuZGF0YXN0YXguY29tL2F1dGgvcmVhbG1zL0Nsb3VkVXNlcnMiLCJhdWQiOiJhdXRoLXByb3h5Iiwic3ViIjoiY2VjYzdmOTEtZjhmNi00NDNkLWFjMTktY2RjMGUyZDZhN2U5IiwidHlwIjoiSUQiLCJhenAiOiJhdXRoLXByb3h5IiwiYXV0aF90aW1lIjoxNjY0NDE3NDcxLCJzZXNzaW9uX3N0YXRlIjoiYjFmODc5NGYtODc5MC00MzVkLTljZTAtMDk3YjcxZTY3Y2FlIiwiYWNyIjoiMSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwibmFtZSI6ImF1ZG9ib3QgbXVzaWMiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhdWRvYm90bXVzaWNhQGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJhdWRvYm90IiwiZmFtaWx5X25hbWUiOiJtdXNpYyIsImVtYWlsIjoiYXVkb2JvdG11c2ljYUBnbWFpbC5jb20ifQ.Uvx17f2HccKjk_5vbaRlZDhFxQDe561EbkpSA_70wqoT7nyGu5HcjnffbTcNwLR5GF9cLxetXRKZ4gvFXJnB3vQ_sTAthWIau6VajH7mVe6kLgMnM_7oaFkmL0IhPBHo9zOujDFr2eFO8Oxb2mLp7wo-fDtHrAnjUD8bJAsv1w5vvLPOYQ-5_cPuyTetunvSBr3vq9DXIwlf-9HyHZXeEbHfSQcv-86y4Y1Khq_RM7HHtET7_jUW5kVTJIouX6nscK3xcPOms-B0sWp8Lr2VDYAkaXKqWCgtPbg7P0xjm0morZcytCmzM8wfvOdZ63GwufC7k4oXyoK_O4YsFZir7Q',
    'Accept': '*/*',
  };

  

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
          version
        }
      }
    }`
    const headers = this.headers;
    var res = this.http.post<any>('https://8cdfec44-3da0-4276-878b-298c404593d0-us-east1.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    return await lastValueFrom(res);
  }

  async addNewUser(username: string, is_streamer: boolean, profile_pic: File | undefined, version: number): Promise<boolean> {
    let res: any;
    const userProfileString = sessionStorage.getItem('userProfile');

    if (!userProfileString) {
      throw new Error('userProfile not found in sessionStorage');
    }
    const userProfile = JSON.parse(userProfileString).info;
    console.log("userProfile: " + userProfile);
    console.log("profilePicNull?: " + (profile_pic === null));
    console.log("profilePicType: " + typeof(profile_pic));
    // create user from sessionStorage.userProfile and arguments
    const dateNow = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let pfpBuffer;
    var enc = new TextDecoder("utf-8");
    profile_pic?.arrayBuffer().then((buffer) => {
      
      pfpBuffer = buffer.slice(0, 100);
      console.log("pfpBuffer: " + pfpBuffer);
    });
    const user: any = {
      user_id: userProfile.sub,
      email: userProfile.email,
      username: username,
      created: dateNow,
      updated: dateNow,
      is_streamer: is_streamer,
      profile_pic: enc.decode(pfpBuffer),
      version: version
    }


    console.log(user);
    let success = false;
    
    await this.addNewUserMutation(user).then((res) => {
      console.log(JSON.stringify(res));
      success = res.data.insertuser_by_id.value.username !== (undefined || "");
      console.log("addNewUser success: " + success);
    });
    const myPromise = new Promise<boolean>((resolve) => {
      resolve(success);
    });
    return myPromise;
  }

  async addNewUserMutation(user: User) {
    const body: any = `
      mutation {
        insertuser_by_id(
          value: { 
            user_id: "` + user.user_id + `",
            created: "` + user.created + `",
            email: "` + user.email + `",
            is_streamer: ` + user.is_streamer + `,
            profile_pic: "` + user.profile_pic + `",
            updated: "` + user.updated + `",
            username: "` + user.username + `",
            version: ` + user.version + `
          }
        ) {
          value {
            username
          }
        }
      }`
    const headers = this.headers;
    var res = this.http.post<any>('https://8cdfec44-3da0-4276-878b-298c404593d0-us-east1.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    return await lastValueFrom(res);
  }
  


}
