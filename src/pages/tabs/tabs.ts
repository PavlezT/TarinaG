import { Component, Inject } from '@angular/core';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { NativeStorage } from '@ionic-native/native-storage';
import { Platform } from 'ionic-angular';
import { Device } from '@ionic-native/device';

import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import { TeeTimesPage } from '../tee-times/tee-times';
import { LatestNewsPage } from '../latest-news/latest-news';
import { PartnersPage } from '../partners/partners';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { GeneralService } from '../../utils/service';

declare var cordova:any;

@Component({
  selector: 'tabs-page',
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = TeeTimesPage;
  tab3Root = LatestNewsPage;
  tab4Root = PartnersPage;
  tab5Root = ContactPage;

  splash : boolean;
  button : boolean;
  backcolor : string;
  imageUrl : string;
  timer : number;
  link : string;

  padding : any;

  fileTransfer : FileTransferObject;

  constructor( public platform: Platform, @Inject(GeneralService) public service : GeneralService,private iab: InAppBrowser,
    public nativeStorage : NativeStorage, private transfer: FileTransfer,
    public device: Device) 
  {
    this.splash = true;
    this.button = true;//false
    this.backcolor = 'rgba(200,200,200,0.8)';
    this.imageUrl = '';//'assets/imgs/logo.gif';
    this.timer = 10;
    this.link = null;//'https://www.google.com';
    this.padding = null;

    this.platform.ready().then(() => {
      try{
        this.fileTransfer = this.transfer.create();
      }catch(e){console.log('<Iamges> FileTransfer _initing error',e)};
      
      try{
        var item : any = window.localStorage.getItem('splash');
        if(item && item.length > 0){
          item = JSON.parse(item);
          this.backcolor = item.backcolor;
          // this.imageUrl = item.imageUrl;
          this.loadImage(item.imageUrl);
          this.timer = parseInt(item.timer) || 5;
          this.link  = item.link;
        }
      }catch(e){
        console.log('<SplashScreen> JSON.parse error:',e);
      }
      // this.startShow();
      this.service.getApp.then(()=>{this.getSpashScreen()});
      this.padding = this.device.model.toLowerCase().includes('iphone x') || this.device.model.toLowerCase().includes('iphone10') || this.device.model.toLowerCase().includes('iphone 10');
    })
  } 

  public getSpashScreen() : Promise<any> {
    return this.service.get(`_api/SplashScreens?filter={"appid" : "${this.service.app.id}" }`)
      .then((splash) => {
        splash = splash.json();
        if( !(splash && splash[0] && splash[0].timer) )
          return false;
        
        if( (this.service.serverAPIUrl + splash[0].imageUrl) != this.imageUrl)
          this.loadImage(this.service.serverAPIUrl+splash[0].imageUrl);// this.imageUrl = this.service.serverAPIUrl+splash[0].imageUrl;
        if( splash[0].backcolor != this.backcolor)
          this.backcolor = splash[0].backcolor;
        if( splash[0].link != this.link)
          this.link = splash[0].link;

        window.localStorage.setItem('splash',JSON.stringify({backcolor : this.backcolor,imageUrl : this.service.serverAPIUrl+splash[0].imageUrl ,timer : (parseInt(splash[0].timer) || 5),link : this.link}))
      })
      .catch(error=>{
        console.log('<SplashScreen custom> error:',error);
      })
  }

  public startShow() : void {
    var interval = setInterval(()=>{
      this.timer--;
      if(this.timer == 0){
        this.hideSplash();
        this.button = true;
        clearInterval(interval);
      }
    }, 1000); 
  }

  public hideSplash() : void {
    this.splash = false;
  }

  public openLink() : void {
    if(!this.link)
      return;

    const browser = this.iab.create(this.link,'_blank',{
      location : 'no',
      zoom : 'no',
      hidden : 'no'
    });
     
    // this.showLoader();
    try{
      browser.on('loadstop').subscribe((type)=>{
        browser.show();
        // this.loader.dismiss();
      })

      browser.on('loaderror').subscribe((type) => {
        // this.toast.showToast('Error occur while loading page.');
      })
    }catch(e){
      console.log('Run in browser');
    }
  }

  private loadImage(url) : Promise<any> {
      let endpointURI = cordova && cordova.file && cordova.file.dataDirectory ? cordova.file.dataDirectory : 'file:///android_asset/';

      return (this.fileTransfer && this.fileTransfer.download(url,endpointURI+(Date.now())+'.png',true,{headers:{'Content-Type':`image/png`,'Accept':`image/webp`}}))
          .then(data=>{
              console.log('<Image> file transfer success',data);
              this.imageUrl = data.nativeURL;
              this.startShow();
          })
          .catch(err=>{
              console.error('<Images> file transfer error',err);
              this.startShow();
          })
  }


}
