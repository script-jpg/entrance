import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, observable, Subject } from 'rxjs';
import AstraDBToken from '../AstraDBToken.json';
import { Location } from '@angular/common';



export interface StreamerSettings {
  user_id: string,
  cool_down_seconds: number,
  platform_name: string,
  streamer_platform_id: string,
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
    'Access-Control-Allow-Origin': '*',
    
  };

  

  constructor(http: HttpClient, private location: Location) { 
    this.http = http;
  }

  private isNewUser = new Subject<boolean>();
  private userData = new Subject<User>();
  private streamerData = new Subject<User>();
  private streamerSettings = new Subject<StreamerSettings>();


  // streamerDataObject: User | null = null;
  // userDataObject: User | null = null;

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
          platform_name,
          streamer_platform_id,
          price_per_minute
        }
    
      }
    }`
    // console.log('Getting Streamer Settings');
    const headers = this.headers;
    var res = this.http.post<any>('https://95190683-5f68-44bf-a587-897c5b2e623e-us-east-2.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    await lastValueFrom(res).then((res) => {
      console.log(res.data);
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
    var res = this.http.post<any>('https://95190683-5f68-44bf-a587-897c5b2e623e-us-east-2.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    await lastValueFrom(res).then((res) => {

      console.log("res data May 16: "+JSON.stringify(res))
      
      const isNewUser: boolean = res.data.user_by_id.values.length === 0;
      this.isNewUser.next(isNewUser);
      if (!isNewUser) {
        const user: User = res.data.user_by_id.values[0];
        location.next(user);
        // // localStorage.setItem('userData', JSON.stringify(user));
        // if (location === this.userData) {
        //   localStorage.setItem('user_id', user.user_id);
        //   // this.userDataObject = user;

        // } else if (location === this.streamerData) {
        //   localStorage.setItem('streamer_id', user.user_id);
        //   // this.streamerDataObject = user;

        // }
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

  async addNewStreamerSettings(platform_name: string, platform_id: string, cool_down_seconds: number, price_per_minute: any): Promise<string> {
    // Convert price_per_minute to a number and then to a string with 2 decimal places
    price_per_minute = Number(price_per_minute).toFixed(2);
  
    console.log('platform_name: ' + platform_name, 'platform_id: ' + platform_id, 'cool_down_seconds: ' + cool_down_seconds, 'price_per_minute: ' + price_per_minute);
  
    const user_id = sessionStorage.getItem('user_id');
  
    // Since addNewStreamerSettingsMutation expects price_per_minute to be a number,
    // convert the string back to a number.
    await this.addNewStreamerSettingsMutation(user_id, platform_name, platform_id, cool_down_seconds, Number(price_per_minute)).then((res) => {
      console.log(JSON.stringify(res));
      return res;
    });
  
    const myPromise = new Promise<string>((resolve) => {
      resolve("success");
    });
    return myPromise;
  }
  
  

  async addNewStreamerSettingsMutation(user_id: string, platform_name: string, platform_id: string, cool_down_seconds: number, price_per_minute: any) {
    const body: any = `
    mutation {
      insertstreamer_settings_by_id(
        value: { 
          user_id: "${user_id}",
          cool_down_seconds: ${cool_down_seconds},
          platform_name: "${platform_name}",
          streamer_platform_id: "${platform_id}",
          price_per_minute: "${price_per_minute}"
        }
      ) {
        value {
          user_id
        }
      }
    }`
    
    const headers = this.headers;
    
    const res = this.http.post<any>('https://95190683-5f68-44bf-a587-897c5b2e623e-us-east-2.apps.astra.datastax.com/api/graphql/entrance', body, {headers});
    
    return lastValueFrom(res);
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
    var res = this.http.post<any>('https://95190683-5f68-44bf-a587-897c5b2e623e-us-east-2.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    return await lastValueFrom(res);
  }

  async updateConnectionId(user_id: string, connection_id: string) {
    const body: any = `
    mutation updateUserConnectionId {
      user: updateuser_by_id(value: {user_id:"${user_id}", connection_id: "${connection_id}"}, ifExists: true ) {
        value {
          user_id
          connection_id
        }
      }
    }`
    const headers = this.headers;
    var res = this.http.post<any>('https://95190683-5f68-44bf-a587-897c5b2e623e-us-east-2.apps.astra.datastax.com/api/graphql/entrance', body, {headers})
    return await lastValueFrom(res).then((res) => {
      console.log("updateConnectionId: " + res.data.user.value.user_id + " " + res.data.user.value.connection_id);
    });
  }
  


}
