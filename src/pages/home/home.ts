import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SubmenuPage } from '../submenu/submenu';
import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  services: Array<{ name: string, icon: string, notification: boolean, component: any }>;

  constructor(public navCtrl: NavController) {
    this.setServices();
  }

  setServices() {
    this.services = [
      { name: 'Website', icon: 'wwwlogo', notification: true, component: null },
      { name: 'Facebook', icon: 'fblogo', notification: false, component: null },
      { name: 'Instagram', icon: 'instalogo', notification: true, component: null },
      { name: 'Twitter', icon: 'twitterlogo', notification: true, component: null },
      { name: 'YouTube', icon: 'youtubelogo', notification: false, component: null },
      { name: 'NexGolf', icon: 'nglogo', notification: true, component: SubmenuPage },
      { name: 'Addional Services', icon: 'aslogo', notification: false, component: SubmenuPage }
    ]
  }

  openService(s) {
    if (s.component) {
      this.navCtrl.push(s.component, {
        pageName: s.name
      });
    }
    console.log(s.name + ' clicked');
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}
