import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer-content',
  templateUrl: './footer-content.component.html',
  styleUrls: ['./footer-content.component.scss']
})
export class FooterContentComponent implements OnInit {

  width = window.innerWidth/2+"px";

  constructor() { }

  ngOnInit(): void {
    console.log("width: " + this.width);

  }

}
