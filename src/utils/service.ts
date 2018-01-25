import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import * as consts from './consts';

@Injectable()
export class GeneralService {
    serverAPIUrl: string;
    user: any;
    userGot: boolean;
    logo : string;
    app : any;
    temperature : number;
    weather : string;
    Sites : any;

    constructor (private  http: Http) {
        this.serverAPIUrl = consts.siteUrl;
        this.user = null;
        this.logo = 'assets/imgs/logo.gif';
        this.app = {};
        this.temperature = 0;
        this.weather = `/assets/imgs/weather/02d.png`;
        this.Sites = [];

        this.loadApp()
            .then(() => {
                return this.getWeather(this.app.latitude,this.app.longitude);
            })
            .then((data) => {
                data = data.json();
                this.weather = `/assets/imgs/weather/${data.weather[0].icon}.png`;
                this.temperature = data.main.temp;
            })
            .catch(error=>{
                console.error('<Get Weather> error:',error);
            })
    }

    public loadApp() : Promise<any>{
        return this.get(`_api/Apps/id/${consts.appid}`)
            .then(data=>{
                this.app = data.json()[0];
                this.logo = this.serverAPIUrl+this.app.logourl;
                return this.app.logourl;
            })
            .catch(error=>{
                console.error('<Error occur> loading app');
            })
    }

    public getWeather(latitude,longitude) : Promise<any>{
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${consts.weatherApiKey}&units=metric`;
        return this.http.get(url).toPromise();
    }

    public get (queryUrl: string) {
        queryUrl = this.serverAPIUrl+queryUrl;
        return this.httpGet(queryUrl);
    }

    private httpGet(queryUrl: string) : Promise<any>{
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
        return this.httpsPost(queryUrl, object);
    }

    private httpsPost (queryUrl: string, object: Object)  : Promise<any>{
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