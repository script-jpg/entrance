import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreatorPageComponent } from './creator-page/creator-page.component';

const routes: Routes = [
  { path: '', redirectTo: 'user/'+localStorage.getItem("creator_id"), pathMatch: 'full' },
  { path: 'user/:creator_id', component: CreatorPageComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
