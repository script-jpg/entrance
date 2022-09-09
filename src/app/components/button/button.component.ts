import { Component, OnInit } from '@angular/core';
import { Output, Input, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Output() clickEvent = new EventEmitter();
  @Input() text: string = "";

  constructor() { }

  ngOnInit(): void {
  }

  onClick() {
    this.clickEvent.emit();
  }

}
