import { Component, Inject } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { DomSanitizer } from '@angular/platform-browser';

import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-tee-times',
  templateUrl: 'tee-times.html',
})
export class TeeTimesPage {

  teetimes_href : any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
     @Inject(GeneralService) public service : GeneralService, private sanitizer: DomSanitizer) {
    this.teetimes_href = this.sanitizer.bypassSecurityTrustResourceUrl('https://google.com');
    this.loadHref();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TeeTimesPage');
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

  public loadHref() : Promise<any> {
    return this.service.getApp
      .then(()=>{
        this.teetimes_href =  this.sanitizer.bypassSecurityTrustResourceUrl(this.service.app.teetimes_href);
      })
  }

}
