import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { GoogleApiService } from 'src/app/services/google-api.service';
import {OAuthService} from 'angular-oauth2-oidc';
import { HttpClient } from '@angular/common/http';
import { GoogleAuthService } from 'src/app/services/google-auth.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit {
  googleApi: GoogleApiService;
  googleAuth: GoogleAuthService;
  constructor(googleApi: GoogleApiService, googleAuth: GoogleAuthService) {
    this.googleApi = googleApi;
    this.googleAuth = googleAuth;
  }

  ngOnInit(): void {
  }

  googleLogin() {
    console.log("google login");
    console.log(this.googleAuth.getGoogleAuthUrl());
  }



}
