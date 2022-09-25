import { Injectable } from '@angular/core';
import { GoogleApis } from 'googleapis';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  google = new GoogleApis();

  constructor() { }

  

  oauth2Client = new this.google.auth.OAuth2(
    '55639457027-ehdk6upha54bsu1bfrjl4qff67t8e42v.apps.googleusercontent.com',
    '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',
    'http://localhost:4200'
  );

  // generate a url that asks permissions for Blogger and Google Calendar scopes


  getGoogleAuthUrl(): string {
    const url = this.oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
  
      // If you only need one scope you can pass it as a string
      scope: []
    });
    return url;
  }
}
