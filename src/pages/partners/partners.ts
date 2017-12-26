import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-partners',
  templateUrl: 'partners.html',
})
export class PartnersPage {

  partners: any = 'Vanha';

  constructor(public navCtrl: NavController) {
    
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}
