import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, observable, Subject } from 'rxjs';
import AstraDBToken from '../AstraDBToken.json';


export interface StreamerSettings {
  user_id: string,
  cool_down_seconds: number,
  platform_id: string,
  price_per_minute: number,
}

export interface User {
  user_id: string
  email: string,
  username: string,
  created: string,
  updated: string,
  is_streamer: boolean,
  profile_pic: string,
  version: number
}

@Injectable({
  providedIn: 'root'
})
export class GraphqlService{
  http: HttpClient;
  headers = { 
    'Content-Type': 'application/graphql', 
    'x-cassandra-token': AstraDBToken.token,
    'Accept': '*/*',
  };

  

  constructor(http: HttpClient) { 
    this.http = http;
  }

  private isNewUser = new Subject<boolean>();
  private userData = new Subject<User>();
  private streamerData = new Subject<User>();
  private streamerSettings = new Subject<StreamerSettings>();

  getIsNewUser() {
    return this.isNewUser.asObservable();
  }

  getUserData() {
    return this.userData;
  }

  getStreamerData() {
    return this.streamerData;
  }

  getStreamerSettings() {
    return this.streamerSettings.asObservable();
  }

  async queryStreamerSettings(user_id: string) {
    const body: string = `
    query OneStreamer {
      streamer_settings_by_id(value: {user_id: "${user_id}"}) {
        values {
          user_id,
          cool_down_seconds,
          platform_id,
          price_per_minute
        }
    
      }
    }`
    // console.log('Getting Streamer Settings');
    const headers = this.headers;
    var res = this.http.post<any>('https://8cdfec44-3da0-4276-878b-298c404593d0-us-east1.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    await lastValueFrom(res).then((res) => {
      // console.log(res.data);
      this.streamerSettings.next(res.data.streamer_settings_by_id.values[0]);
    });
    // console.log('Finished getting streamer settings.')
  }


  async queryUser(user_id: string, location: Subject<User>) {
    const body: any = `query oneUser {
      user_by_id(value: { user_id: "${user_id}" }) {
        values {
          user_id
          email,
          username,
          created,
          updated,
          is_streamer,
          profile_pic,
          version
        }
      }
    }`
    const headers = this.headers;
    var res = this.http.post<any>('https://8cdfec44-3da0-4276-878b-298c404593d0-us-east1.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    await lastValueFrom(res).then((res) => {
      const isNewUser: boolean = res.data.user_by_id.values.length === 0;
      this.isNewUser.next(isNewUser);
      if (!isNewUser) {
        location.next(res.data.user_by_id.values[0]);
      }
    });
  }

//   changeFile(file: Blob) {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.readAsDataURL(file);
//         reader.onload = () => resolve(reader.result);
//         reader.onerror = error => reject(error);
//     });
// }


  
  async addNewUser(username: string, is_streamer: boolean, profile_pic: string, version: number): Promise<string> {
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


    const user: User = {
      user_id: userProfile.sub,
      email: userProfile.email,
      username: username,
      created: dateNow,
      updated: dateNow,
      is_streamer: is_streamer,
      profile_pic: profile_pic,
      version: version
    }


    // console.log(user);
    let successUserId = "";
    
    await this.addNewUserMutation(user).then((res) => {
      console.log(JSON.stringify(res));
      successUserId = res.data.insertuser_by_id.value.user_id;
      // console.log("addNewUser success: " + success);
    });
    const myPromise = new Promise<string>((resolve) => {
      resolve(successUserId);
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
            user_id
          }
        }
      }`
    const headers = this.headers;
    var res = this.http.post<any>('https://8cdfec44-3da0-4276-878b-298c404593d0-us-east1.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    return await lastValueFrom(res);
  }
  


}
