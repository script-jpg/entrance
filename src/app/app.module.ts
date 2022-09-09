import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NbThemeModule, NbLayoutModule, NbProgressBarModule, NbActionsModule } from '@nebular/theme';
import { NbEvaIconsModule } from '@nebular/eva-icons';
import { FooterContentComponent } from './components/creator/footer-content/footer-content.component';
import { ButtonComponent } from './components/button/button.component';
import { NbButtonModule } from '@nebular/theme';
import { SetupBuyCallComponent } from './components/creator/footer-content/setup-buy-call/setup-buy-call.component';
@NgModule({
  declarations: [
    AppComponent,
    FooterContentComponent,
    ButtonComponent,
    SetupBuyCallComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: 'cosmic' }),
    NbLayoutModule,
    NbEvaIconsModule,
    NbButtonModule,
    NbProgressBarModule,
    NbActionsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
