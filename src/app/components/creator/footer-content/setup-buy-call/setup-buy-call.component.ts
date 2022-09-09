import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setup-buy-call',
  templateUrl: './setup-buy-call.component.html',
  styleUrls: ['./setup-buy-call.component.scss']
})
export class SetupBuyCallComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  value = 25;

  setValue(newValue: number) {
    this.value = Math.min(Math.max(newValue, 0), 100)
  }

  get status() {
    if (this.value <= 25) {
      return 'danger';
    } else if (this.value <= 50) {
      return 'warning';
    } else if (this.value <= 75) {
      return 'info';
    } else {
      return 'success';
    }
  }

}
