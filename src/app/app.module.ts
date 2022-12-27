import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, SafePipe } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbDialogModule, NbDialogService, NbDialogRef} from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FooterContentComponent } from './components/creator/footer-content/footer-content.component';
import { ButtonComponent } from './components/button/button.component';
import { NbButtonModule, NbInputModule, NbCheckboxModule, NbSelectModule, NbCardModule, NbToastrModule} from '@nebular/theme';
import { SetupBuyCallComponent } from './components/creator/footer-content/setup-buy-call/setup-buy-call.component';
import { MatSliderModule } from '@angular/material/slider';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';
import { OnboardModalComponent } from './components/onboard-modal/onboard-modal.component';
import { FormsModule } from '@angular/forms';
import { HeaderContentComponent } from './components/creator/header-content/header-content.component';
import { CreatorPageComponent } from './creator-page/creator-page.component';




@NgModule({
  declarations: [
    AppComponent,
    FooterContentComponent,
    ButtonComponent,
    SetupBuyCallComponent,
    AuthModalComponent,
    OnboardModalComponent,
    HeaderContentComponent,
    CreatorPageComponent,
    SafePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'cosmic' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbButtonModule,
    MatSliderModule,
    NbDialogModule.forRoot(),
    OAuthModule.forRoot(),
    HttpClientModule,
    FormsModule,
    NbInputModule,
    NbCheckboxModule,
    NbSelectModule,
    NbCardModule,
    NbToastrModule.forRoot(),
  ],
  providers: [
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
