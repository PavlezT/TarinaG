import { Component, Inject } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { NativeStorage } from '@ionic-native/native-storage';
import { Toast } from '../../utils/toast';
import { GeneralService } from '../../utils/service';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'page-accounts',
  templateUrl: 'accounts.html',
})
export class AccountsPage {

  pageTitle: string = '';
  password : string;
  username : string;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
    public viewCtrl: ViewController, public nativeStorage: NativeStorage,
    @Inject(GeneralService) public service : GeneralService, @Inject(Toast) public toast : Toast,
    private  http: Http) {
    this.pageTitle = this.navParams.get('pageName');

    this.nativeStorage.getItem(this.pageTitle)
      .then(
        credentials => {
          this.password = credentials.password;
          this.username = credentials.username;
        },
        error => {
          console.error('<Auth> Error getting credentials from storage:',error);
          // this.toast.showToast('Error loading your credentials');
        }
      )
  }

  dismissView() {
    this.viewCtrl.dismiss();
  }

  public getLogin() : Promise<any> {
    if(! (this.password && this.password.trim().length > 0 && this.username && this.username.trim().length > 0) )
      return this.toast.showToast('Check your credentials!');
    
    this.username = this.username.trim();
    this.password = this.password.trim();

    return this.nativeStorage.setItem(this.pageTitle,{username:this.username,password: this.password})
      .then(data => console.log('<Auth> User credentials data saved'))
      .then(()=>{
        return this.sendLogin();
      })
      .then(()=>{
        return this.toast.showToast('Login for'+this.username);
      })
      .catch(error => {
        console.error('<Auth> Error setting credentials in storage:',error);
        return this.toast.showToast('Login error: Check your credentials!');
      })
  }

  private sendLogin() : Promise<any> {
    var data = this.getLoginData(this.pageTitle);
    if(!data.method)
      return Promise.reject('There is not endpoint for:'+this.pageTitle);

    let options = new RequestOptions({headers: data.headers})
    return (data.method == "POST" ? this.http.post(data.url,data.body,options) : this.http.get(data.url,options)).toPromise()
      .then((resp)=>{
        console.log('Success:',resp);
        // console.log('Success json:',resp.json());
      })
  }

  private getLoginData(page : string) : {url : string, body : any, method : string, headers : Headers} {
    let data = {
      method : null,
      url : null,
      body : null,
      headers : null
    };

    switch(page){
      case 'NexGolf' : {
        data.method = "POST";
        data.url = "http://tarina.nexgolf.fi/tarina/login.nxg";
        // data.body = new FormData();
        data.body = `membershipNumber=${this.username}&password=${this.password}&executeLogin=Kirjaudu+sis%E4%E4n&loginTarget=LEGACY`;
        data.headers = new Headers();
        data.headers.append('Content-Type','application/x-www-form-urlencoded');
        // data.body.append('membershipNumber',this.username);
        // data.body.append('password',this.password);
        // data.body.append('executeLogin','Kirjaudu+sis%E4%E4n');
        // data.body.append('loginTarget','LEGACY');
        break;
      }
    }

    return data;
  }

}
