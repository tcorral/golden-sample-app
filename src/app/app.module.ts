import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { authConfig, environment } from '../environments/environment';
import { AvatarModule, DropdownMenuModule, IconModule, LayoutModule, LogoModule } from '@backbase/ui-ang';
import { EntitlementsModule } from '@backbase/foundation-ang/entitlements';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './guards/auth.guard';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { MakeTransferCommunicationService } from 'transfer-journey';
import { TRANSACTIONS_JOURNEY_COMMUNICATION_SERIVCE } from 'transactions-journey';

import { JourneyCommunicationService } from './services/journey-communication.service';

import { AuthConfig, OAuthModule, OAuthModuleConfig, OAuthService, OAuthStorage } from 'angular-oauth2-oidc';

@NgModule({
  declarations: [ AppComponent ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    EntitlementsModule,
    DropdownMenuModule,
    IconModule,
    LayoutModule,
    LogoModule,
    NgbDropdownModule,
    AvatarModule,

    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    OAuthModule.forRoot(),
  ],
  providers: [
    ...environment.mockProviders,
    AuthGuard,
    {
      provide: MakeTransferCommunicationService,
      useExisting: JourneyCommunicationService,
    },
    {
      provide: TRANSACTIONS_JOURNEY_COMMUNICATION_SERIVCE,
      useExisting: JourneyCommunicationService,
    },
    { provide: AuthConfig, useValue: authConfig },
    {
      provide: OAuthModuleConfig,
      useValue: {
        resourceServer: {
          allowedUrls: [ 'http://www.angular.at/api' ],
          sendAccessToken: true,
        },
      },
    },
    { provide: OAuthStorage, useFactory: () => localStorage },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [ OAuthService ],
      useFactory: (oAuthService: OAuthService) => () => oAuthService.loadDiscoveryDocumentAndTryLogin()
    }
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule {
}
