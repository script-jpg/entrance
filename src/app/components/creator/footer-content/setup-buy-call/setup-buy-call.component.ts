import { Component, OnInit } from '@angular/core';
const perMinCost: number = 30;
@Component({
  selector: 'app-setup-buy-call',
  templateUrl: './setup-buy-call.component.html',
  styleUrls: ['./setup-buy-call.component.scss']
})
export class SetupBuyCallComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  cost: number = perMinCost;
  minutes: number = 1;


  pitch(event: any) {
    this.cost = event.value * perMinCost;
    this.minutes = event.value;
  }

  onConfirmBuyCall() {

  }

}
