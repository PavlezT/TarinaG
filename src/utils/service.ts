import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import * as consts from './consts';

@Injectable()
export class GeneralService {
    serverAPIUrl: string;
    user: any;
    userGot: boolean;

    constructor (private  http: Http) {
        this.serverAPIUrl = consts.siteUrl;
        this.user = null;
    }

    public get (queryUrl: string) {
        queryUrl = this.serverAPIUrl+queryUrl;
        return this.httpGet(queryUrl);
    }

    public httpGet(queryUrl: string){
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

    public post (queryUrl : string, object : Object) {
        queryUrl = this.serverAPIUrl + queryUrl;
        return this.httpsPost(queryUrl, object);
    }

    public httpsPost (queryUrl: string, object: Object) {
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