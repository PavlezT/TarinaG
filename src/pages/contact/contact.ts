import { Component, Inject } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {

  contactsInformation : string;

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService) {
    this.setDetails();
  }

  setDetails() {
    this.service.getApp
      .then(() => {
        return this.service.get(`_api/Contacts/appid/${this.service.app.id}`)
      })
      .then((res)=>{
        let info = res.json();

        if(info && info[0] && info[0].text)
          this.contactsInformation = info[0].text;
        else 
          this.contactsInformation = ' ';
      })
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

}
