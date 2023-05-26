import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {

  private globalData: any;

  constructor() {
    // Initialize your data here if needed
    this.globalData = {};
  }

  setGlobalData(data: any): void {
    this.globalData = data;
  }

  addGlobalData(key: string, value: any): void {
    this.globalData[key] = value;
  }

  getGlobalData(): any {
    return this.globalData;
  }

  getGlobalDataByKey(key: string): any {
    return this.globalData[key];
  }
}
