import { EventEmitter, Injectable, OnDestroy, OnInit, Output } from '@angular/core';
import { Client, IMessage, messageCallbackType, Stomp, StompSubscription } from '@stomp/stompjs';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class SocketClientService {
  
  public host = environment.wsApiUrl;

  private client: Client = new Client();

  @Output() public connectEvent: EventEmitter<any> = new EventEmitter();

  constructor(private authService: AuthenticationService) {
    
  }
  connect(): void {
    if(this.client.connected){
      this.connectEvent.emit(null);
    }
    this.authService.loadToken();
    this.client = new Client({
      brokerURL: `${this.host}/game`,
      connectHeaders: {
        token: `${this.authService.isUserLoggedIn() ? this.authService.getToken() : ""}`
      },
      debug: function (str) {
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    const _this = this;
    this.client.onConnect = function (frame:any) {
      _this.authService.addUserToLocalCache({username: ''+frame.headers['user-name'], isActive: true, role: '', authorities: []});
     
      console.log(_this.authService.getUserFromLocalCache());
      
      _this.connectEvent.emit(frame);
    };

    this.client.onStompError = function (frame:any) {
      console.log("error");

      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
    };
    this.client.activate();
  }

  public publish(destination: string, body:any) {
    this.client.publish({
      destination: destination,
      body: JSON.stringify(body)
    });
  }
  public subscribe(destination: string, callback: messageCallbackType): StompSubscription {
    return this.client.subscribe(destination, callback);
  }

}