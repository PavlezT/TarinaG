import { Component, Inject } from '@angular/core';
import { NavController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { LoadingController, Loading } from 'ionic-angular';

import { SettingsPage } from '../settings/settings';
import { GeneralService } from '../../utils/service';

@Component({
  selector: 'page-partners',
  templateUrl: 'partners.html',
})
export class PartnersPage {

  Tabs : Array<any>;
  Icons : Array<any>;
  selectedTab : any;
  loader : Loading;

  constructor(public navCtrl: NavController, @Inject(GeneralService) public service : GeneralService,
    private iab: InAppBrowser, public loadingCtrl: LoadingController) {
    this.service.getApp
      .then(()=>{
        return Promise.all([this.getTabs(),this.getIcons()]);
      })
      .then(()=>{
        if(this.Tabs.length > 0)
          this.selectedTab = this.Tabs[0].id;
      })
  }

  openSettings(){
    this.navCtrl.push(SettingsPage);
  }

  public getTabs() : Promise<any> {
    return this.service.get(`_api/Partners_Tabs?filter={"appid":${this.service.app.id}}`)
      .then((tabs)=>{
        this.Tabs = tabs.json();
        this.Tabs.sort((a:any,b:any)=>{
          if(parseInt(a.order) > parseInt(b.order))
            return 1;
          return -1;
        })
      })
      .catch(error=>{
        console.error('<Get Tabs> error:',error);
        this.Tabs = [];
      })
  }

  public getIcons() : Promise<any>{
    return this.service.get(`_api/Partners_Icons?filter={"appid":${this.service.app.id}}`)
      .then((icons)=>{
        this.Icons = icons.json();
      })
      .catch(error=>{
        console.error('<Get Icons> error:', error);
        this.Icons = [];
      })
  }

  public openLink(icon) : void {
    const browser = this.iab.create(icon.href,'_blank',{
      location : 'no',
      zoom : 'no',
      hidden : 'yes'
    });
    
    this.showLoader();
    try{
      browser.on('loadstop').subscribe((type)=>{
        browser.show();
        this.loader.dismiss();
      })

      browser.on('loaderror').subscribe((type) => {
        this.loader.dismiss();
      })
    }catch(e){
      console.log('Run in browser');
      this.loader.dismiss();
    }

  }

  public showLoader() : Promise<any> {
    this.loader = this.loadingCtrl.create({
      content: 'Wait',
    });

    return this.loader.present();
  }

  public selectTab(tab){
    this.selectedTab = tab.id;
  }

}
