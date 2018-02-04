import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { GeneralService } from '../utils/service';
import { Toast } from '../utils/toast';
import { HttpModule } from '@angular/http';
import { AppVersion } from '@ionic-native/app-version';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { TeeTimesPage } from '../pages/tee-times/tee-times';
import { LatestNewsPage } from '../pages/latest-news/latest-news';
import { PartnersPage } from '../pages/partners/partners';
import { SubmenuPage } from '../pages/submenu/submenu';
import { AccountsPage } from '../pages/accounts/accounts';
import { FeedbackPage } from '../pages/feedback/feedback';
import { NotificationsPage } from '../pages/notifications/notifications';
import { SettingsPage } from '../pages/settings/settings';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NativeStorage } from '@ionic-native/native-storage';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    TeeTimesPage,
    LatestNewsPage,
    PartnersPage,
    SubmenuPage,
    AccountsPage,
    FeedbackPage,
    NotificationsPage,
    SettingsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    TeeTimesPage,
    LatestNewsPage,
    PartnersPage,
    SubmenuPage,
    AccountsPage,
    FeedbackPage,
    NotificationsPage,
    SettingsPage
  ],
  providers: [
    StatusBar,InAppBrowser,NativeStorage,
    SplashScreen,GeneralService,Toast,AppVersion,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
