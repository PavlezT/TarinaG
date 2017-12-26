import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  details: Array<{ heading: string, content: string }>;

  constructor(public navCtrl: NavController) {
    this.setDetails();
  }

  setDetails() {
    this.details = [
      { heading: 'Käyntiosoite', content: 'Tarinagolfintie 19, 71800 Siilinjärvi' },
      { heading: 'Laskutusosoite', content: 'Tarinagolf ry ja/tai Tarinaharjun Golf Oy, PL 24, 70501 Kuopio' },
      { heading: 'Sähköposti', content: 'toimisto@tarinagolf.fi' }
    ]
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}
