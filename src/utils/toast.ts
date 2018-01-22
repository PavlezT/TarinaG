import { ToastController } from 'ionic-angular';
import { Injectable } from '@angular/core';

@Injectable()
export class Toast {

    constructor(public toastCtrl : ToastController){

    }

    public showToast(message : string) : Promise<any> {
        let toast = this.toastCtrl.create({
          message: message,
          position: 'bottom',
          showCloseButton : true,
          duration: 9000
        });
        return toast.present();
      }
}