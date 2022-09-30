import { Component, OnInit } from '@angular/core';
import { GoogleApiService } from 'src/app/services/google-api.service';
import {GraphqlService} from '../../../services/graphql.service';
import defaultPfp from '../../../default-img.json'
import { NbGlobalPhysicalPosition, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-header-content',
  templateUrl: './header-content.component.html',
  styleUrls: ['./header-content.component.scss']
})
export class HeaderContentComponent implements OnInit {

  profilePicSrc: string = defaultPfp.src;

  positions = NbGlobalPhysicalPosition;
  private index: number = 0;

  // showToast(position: any, status: any) {
  //   this.index += 1;
  //   this.toastrService.show(status || 'Success', `Toast ${this.index}`, { position, status });
  // }

  constructor(
    public googleApi: GoogleApiService, 
    graphqlService: GraphqlService,
    ) {

      // this.showToast(this.positions.TOP_RIGHT, "Logged in")a;

      graphqlService.getUserData().subscribe((user) => {
        console.log("user: "+user);
        this.profilePicSrc = user.profile_pic;
      });

  }

  ngOnInit(): void {
  }

  handleSelect(item: string): void {
    console.log(item);
    switch (item) {
      case "Log out":
        this.googleApi.signOut();
        break;
      default:
        break;
    }
  }

}
