import { Component, OnInit } from '@angular/core';
import {GraphqlService} from '../../services/graphql.service';
import {NbDialogRef, NbToastrService} from '@nebular/theme';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboard-modal',
  templateUrl: './onboard-modal.component.html',
  styleUrls: ['./onboard-modal.component.scss']
})
export class OnboardModalComponent implements OnInit {

  platform_name: string = "";
  platform_id: string = "";
  cooldown_time: number = 30;
  ppm: number;

  constructor(
    private graphqlService: GraphqlService, 
    protected dialogRef: NbDialogRef<any>,
    private toastrService: NbToastrService) {
    }

  ngOnInit(): void {
  }

  file: Blob | null = null;

  filePreview: string = "";

  isStreamer = false;

  

  toggleStreamer(isStreamer: boolean) {
    this.isStreamer = isStreamer;
  }

  onClickSubmit(result: any) {
    console.log("You have entered : " + result.username); 
    console.log("isStreamer : " + this.isStreamer);
    sessionStorage.setItem('isStreamer', this.isStreamer.toString());
    console.log("file undefined? : " + (this.file === undefined));
    if (this.file === null) {
      this.toastrService.danger("","Please add a profile picture")
    } else if (result.username === "") {
      this.toastrService.danger("","Please add a username")
    } else {
      this.graphqlService.addNewUser(result.username, this.isStreamer, this.filePreview, 1).then((value: any) => {
        
        console.log("success: " + value);
        this.graphqlService.queryUser(value, this.graphqlService.getUserData());
        if (this.isStreamer) {
          this.toastrService.success("", "Streamer Settings can be configured in settings")
          this.graphqlService.addNewStreamerSettings(this.platform_name, this.platform_id, this.cooldown_time, this.ppm).then((value: any) => {
            console.log("Added streamer settings for " + value);
          });
          this.graphqlService.queryUser(value, this.graphqlService.getStreamerData());
        }
        this.dialogRef.close();
        // this.toastrService.success("","")

      });
      
    }
 }

 processFile(imageInput: any) {
  const file = imageInput.files[0];
  this.file = file;
  console.log("file: "+this.file);
  const reader = new FileReader();

  reader.addEventListener('load', (event: any) => {
    console.log(typeof event);
    console.log(typeof event.target.result);
    console.log("event.target.result: "+event.target.result);
    this.filePreview = event.target.result;
    

    // this.selectedFile = new ImageSnippet(event.target.result, file);

    // this.imageService.uploadImage(this.selectedFile.file).subscribe(
    //   (res) => {
      
    //   },
    //   (err) => {
      
    //   })
  });
  reader.readAsDataURL(file);

}

}
