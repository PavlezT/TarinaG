import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-submenu',
  templateUrl: 'submenu.html',
})
export class SubmenuPage {

  pageTitle: string = '';
  services: Array<{ name: string, icon: string, notification: boolean, component: any }>;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.pageTitle = this.navParams.get('pageName');
    this.setServices();
  }

  setServices() {
    if (this.pageTitle == 'NexGolf') {
      this.services = [
        { name: 'Tee Times', icon: 'nglogo', notification: false, component: null },
        { name: 'Competitions', icon: 'nglogo', notification: true, component: null },
        { name: 'Results', icon: 'nglogo', notification: true, component: null }
      ]
    }
    if (this.pageTitle == 'Addional Services') {
      this.services = [
        { name: 'Pro', icon: 'emptylogo', notification: true, component: null },
        { name: 'Proshop', icon: 'emptylogo', notification: true, component: null },
        { name: 'Restaurant', icon: 'emptylogo', notification: true, component: null }
      ]
    }
  }

  openService(s) {
    if (s.component) {

    }
    console.log(s.name + ' clicked');
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}
