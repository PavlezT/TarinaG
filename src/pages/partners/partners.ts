import { Component, Inject } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-partners',
  templateUrl: 'partners.html',
})
export class PartnersPage {

  partners: any = 'Vanha';

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService) {
    
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}
