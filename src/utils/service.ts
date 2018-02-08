import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Platform } from 'ionic-angular';
import { AppVersion } from '@ionic-native/app-version';

import * as consts from './consts';
import * as transen from '../assets/dictionary/en';
import * as transfi from '../assets/dictionary/fi';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class GeneralService {
    serverAPIUrl: string;
    user: any;
    userGot: boolean;
    logo : string;
    app : any;
    temperature : number;
    weather : string;
    dic : any;
    locale : string;
    Sites : Promise<Array<any>>;//Observable<any>;

    getApp : Promise<any>;

    constructor (private  http: Http,public plt: Platform,private appVersion: AppVersion) {
        this.serverAPIUrl = consts.siteUrl;
        this.user = null;
        this.logo = 'assets/imgs/logo.gif';
        this.app = {};
        this.temperature = 0;
        this.weather = `assets/imgs/weather/02d.png`;
        this.dic = {};
        this.locale = navigator.language || 'en';

        this.getDic();
        this.getApp = this.appVersion.getPackageName()
            .catch(error=>{
                console.log('App version in browser');
                return 'club.golf.app';
            })
            .then( appname => {
                return this.loadApp(appname);
            })        
            .then(() => {
                consts.setAppId(this.app.id);
                return this.getWeather(this.app.latitude,this.app.longitude);
            })
            .then((data) => {
                data = data.json();
                this.weather = `assets/imgs/weather/${data.weather[0].icon}.png`;
                this.temperature = parseInt(data.main.temp);
            })
            .catch(error=>{
                console.error('<Get Weather> error:',error);
            });

        this.Sites = this.getApp.then(()=>{
                return this.getSites();
            })
        //new Observable(observer => {
        //     .then((sites) => {
        //         observer.next(sites);
        //         observer.complete();
        //     })   
        // });
    }

    public getSites() : Promise<any> {
        let url = `_api/App_Buttons?filter={"appid":${consts.appid}}&expand=[{"table":"Notifications","key":"id","field":"notificationid"}]`;
        return this.get(url)
          .then( res => {
            let sites = res.json().map(button => {
              button.style = {};
              button.style['color'] = button.text_color;
              button.style['background-color'] = button.back_color;
              if(button.border == 'true'){
                button.style['border-color'] = button.border_color;
                button.style['border-width'] = button.border_width;
              }
            
              return button;
            })
    
            sites.sort((a:any,b:any)=>{
              if(parseInt(a.order) > parseInt(b.order))
                return 1;
              return -1;
            })
    
            return sites;
          })
          .catch(error => {
            return [];
          })
    }

    public getDic() : void {
        if( this.locale.toLowerCase().includes('fi') )
            this.dic = transfi.fi;
        else 
            this.dic = transen.en;
    }

    public loadApp(app_name) : Promise<any> {
        return this.get(`_api/Apps/app_name/${app_name}`)
            .then(data=>{
                this.app = data.json()[0];
                this.logo = this.serverAPIUrl+this.app.logourl;
                return this.app.logourl;
            })
            .catch(error=>{
                console.error('<Error occur> loading app',error);
            })
    }

    public getWeather(latitude,longitude) : Promise<any>{
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${this.app.weather_apikey}&units=metric`;
        return this.http.get(url).toPromise();
    }

    public get (queryUrl: string) {
        queryUrl = this.serverAPIUrl+queryUrl;
        return this.httpGet(queryUrl);
    }

    public httpGet(queryUrl: string) : Promise<any>{
        let headers = new Headers();
        headers.append('Accept', 'application/json;odata=verbose');
        headers.append('Content-Type', 'application/json;odata=verbose');
        let options = new RequestOptions({headers: headers})
        return this.http.get(queryUrl, options).toPromise();
            // .then((response: Object) => {
            //     return response;
            // }).catch((response) => {
            //     if(response.status == '403')
            //         window.location.reload(true);
            //     return response;
            // });
    }

    public post (queryUrl : string, object : Object) : Promise<any> {
        queryUrl = this.serverAPIUrl + queryUrl;
        return this.httpPost(queryUrl, object);
    }

    public httpPost (queryUrl: string, object: Object)  : Promise<any>{
        let headers = new Headers();
        headers.append('Accept', 'application/json;odata=verbose');
        headers.append('Content-Type', 'application/json;odata=verbose');
        let options = new RequestOptions({headers: headers})
        return this.http.post(queryUrl, object , options).toPromise();
            // .then((response: Object) => {
            //     return response;
            // }).catch((response) => {
            //     // if(response.status == '403')
            //     //     window.location.reload(true);
            //     return response;
            // });
    }

}
