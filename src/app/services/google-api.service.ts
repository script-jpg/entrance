import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Observable, Subject } from 'rxjs';
import client from '../OAuth2GoogleInfo.json';


const authCodeFlowConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'https://accounts.google.com',

  // strict discovery document disallows urls which not start with issuers url
  strictDiscoveryDocumentValidation: false,

  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin,

  // The SPA's id. The SPA is registerd with this id at the auth-server
  // clientId: 'server.code',
  clientId: client.web.client_id,

  // set the scope for the permissions the client should request
  scope: 'openid profile email https://www.googleapis.com/auth/gmail.readonly',

  showDebugInformation: true,
};

export interface UserInfo {
  info: {
    sub: string
    email: string,
    name: string,
    picture: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleApiService {
  oAuthService: OAuthService;
  httpClient: HttpClient;

  gmail = 'https://gmail.googleapis.com'

  userProfileSubject = new Subject<UserInfo>()

  

  public userInfo: UserInfo | null = null;

  constructor(oAuthService: OAuthService, httpClient: HttpClient) {
    this.oAuthService = oAuthService;
    this.httpClient = httpClient;
  }

  authenticate(from: string) {
    // confiure oauth2 service
    this.oAuthService.configure(authCodeFlowConfig);
    // manually configure a logout url, because googles discovery document does not provide it
    this.oAuthService.logoutUrl = window.location.origin;

    // loading the discovery document from google, which contains all relevant URL for
    // the OAuth flow, e.g. login url
    this.oAuthService.loadDiscoveryDocument().then( () => {
      // // This method just tries to parse the token(s) within the url when
      // // the auth-server redirects the user back to the web-app
      // // It doesn't send the user the the login page
      this.oAuthService.tryLoginImplicitFlow().then( () => {

        // when not logged in, redirecvt to google for login
        // else load user profile
        if (from === 'button') {
          this.initLoginFlow();
          this.setUserProfile();
        } else if (from === 'app') {
          this.setUserProfile();
        }
      })
    });
  }

  initLoginFlow() {
    if (!this.oAuthService.hasValidAccessToken()) {
      this.oAuthService.initLoginFlow()
    } 
  }

  setUserProfile() {
    if (this.oAuthService.hasValidAccessToken()) {
      this.oAuthService.loadUserProfile().then( (userProfile) => {
        console.log(userProfile as UserInfo)
        sessionStorage.setItem('userProfile', JSON.stringify(userProfile as UserInfo))
        this.userProfileSubject.next(userProfile as UserInfo)
      })
    }
  }

  // emails(userId: string): Observable<any> {
  //   return this.httpClient.get(`${this.gmail}/gmail/v1/users/${userId}/messages`, { headers: this.authHeader() })
  // }

  // getMail(userId: string, mailId: string): Observable<any> {
  //   return this.httpClient.get(`${this.gmail}/gmail/v1/users/${userId}/messages/${mailId}`, { headers: this.authHeader() })
  // }

  isLoggedIn(): boolean {
    return this.oAuthService.hasValidAccessToken()
  }

  signOut() {
    this.oAuthService.logOut()
  }

  // private authHeader() : HttpHeaders {
  //   return new HttpHeaders ({
  //     'Authorization': `Bearer ${this.oAuthService.getAccessToken()}`
  //   })
  // }
}
