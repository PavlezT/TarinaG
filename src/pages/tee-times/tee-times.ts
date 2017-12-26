import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-tee-times',
  templateUrl: 'tee-times.html',
})
export class TeeTimesPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TeeTimesPage');
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}
