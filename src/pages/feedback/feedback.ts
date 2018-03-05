import { Component, Inject, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { GeneralService } from '../../utils/service';
import { Toast } from '../../utils/toast';

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage {

  @ViewChild('name') name : any ;
  @ViewChild('email') email : any;
  @ViewChild('text') text : any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    @Inject(GeneralService) public service : GeneralService,@Inject(Toast) public toast : Toast) {
  }

  dismissView() {
    this.viewCtrl.dismiss();
  }

  public sendMessage(event) : any {
    if( !(this.name.value.trim().length > 0 && this.email.value.trim().length > 0 && this.text.value.trim().length > 0))
      return this.toast.showToast('Fill all the fields!');
    
    var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if( !reg.test(this.email.value) )
      return this.toast.showToast('Enter valid email!');

    event.target.parentNode.disabled = true;
    
    this.service.post('feedback',{
      name : this.name.value.trim(),
      email : this.email.value,
      app : this.service.app.app_name,
      text : this.text.value
    }).then(()=>{
      this.toast.showToast('Your message sended.');
      event.target.parentNode.disabled = false;
    }).catch(()=>{
      this.toast.showToast('Your message didn`t send! Some error occur!');
      event.target.parentNode.disabled = false;
    })
    
  }

}
