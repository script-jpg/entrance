import { Component, OnInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { GoogleApiService } from 'src/app/services/google-api.service';
import {OAuthService} from 'angular-oauth2-oidc';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent implements OnInit {
  googleApi: GoogleApiService;

  constructor(googleApi: GoogleApiService) {
    this.googleApi = googleApi;
  }

  ngOnInit(): void {
  }

  googleLogin() {
    console.log("google login");
    this.googleApi.authenticate("button");
  }



}
