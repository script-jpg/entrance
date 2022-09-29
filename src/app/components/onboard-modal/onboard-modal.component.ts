import { Component, OnInit } from '@angular/core';
import {GraphqlService} from '../../services/graphql.service';

@Component({
  selector: 'app-onboard-modal',
  templateUrl: './onboard-modal.component.html',
  styleUrls: ['./onboard-modal.component.scss']
})
export class OnboardModalComponent implements OnInit {

  constructor(private graphqlService: GraphqlService) { }

  ngOnInit(): void {
  }

  file: File | undefined;

  filePreview: string = "";

  isStreamer = false;

  toggleStreamer(isStreamer: boolean) {
    this.isStreamer = isStreamer;
  }

  onClickSubmit(result: any) {
    console.log("You have entered : " + result.username); 
    console.log("isStreamer : " + this.isStreamer);
    console.log("file undefined? : " + (this.file === undefined));
    this.graphqlService.addNewUser(result.username, this.isStreamer, this.file, 1).then((value) => {
      console.log("success: " + value);
    });
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
