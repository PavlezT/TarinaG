import { Component, Inject } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-tee-times',
  templateUrl: 'tee-times.html',
})
export class TeeTimesPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, @Inject(GeneralService) public service : GeneralService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TeeTimesPage');
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}
