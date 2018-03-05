import { Component, Inject } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  contactsInformation : string;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController,@Inject(GeneralService) public service : GeneralService) {
    this.setDetails();
  }

  setDetails() {
    this.service.getApp
      .then(() => {
        return this.service.get(`_api/AboutInfo/appid/${this.service.app.id}`)
      })
      .then((res)=>{
        let info = res.json();

        if(info && info[0] && info[0].text)
          this.contactsInformation = info[0].text;
        else 
          this.contactsInformation = ' ';
      })
  }

  dismissView() {
    this.viewCtrl.dismiss();
  }

}
