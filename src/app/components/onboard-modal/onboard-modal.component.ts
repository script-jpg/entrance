import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-onboard-modal',
  templateUrl: './onboard-modal.component.html',
  styleUrls: ['./onboard-modal.component.scss']
})
export class OnboardModalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  file: File | undefined;

  filePreview: string = "";

  onClickSubmit(result: any) {
    console.log("You have entered : " + result.username + " " + result.password); 
    console.log(result.pfp);
 }

 processFile(imageInput: any) {
  const file: File = imageInput.files[0];
  const reader = new FileReader();

  reader.addEventListener('load', (event: any) => {
    console.log(typeof event);
    console.log(typeof event.target.result);
    console.log("event.target.result: "+event.target.result);
    this.filePreview = event.target.result;
    console.log("file: "+file);

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
