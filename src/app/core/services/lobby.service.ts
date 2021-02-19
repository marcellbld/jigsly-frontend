import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, OnInit, Output } from '@angular/core';
import { IMessage, StompSubscription } from '@stomp/stompjs';
import { Observable, Subscription } from 'rxjs';
import { JoinType } from 'src/app/shared/enum/join-type.enum';
import { environment } from 'src/environments/environment';
import { GameRoom } from '../../shared/models/game-room';
import { AuthenticationService } from '../authentication/authentication.service';
import { HttpService } from '../http/http.service';
import { SocketClientService } from '../ws/socket-client.service';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  
  public host = environment.apiUrl;

  private subscriptions: Subscription[] = [];
  private stompSubscriptions: StompSubscription[] = [];

  @Output() public newRoomEvent: EventEmitter<any> = new EventEmitter();
  @Output() public playerJoinedEvent: EventEmitter<any> = new EventEmitter();
  
  constructor(private socketClientService:SocketClientService, private httpService: HttpService, private authenticationService: AuthenticationService) { 
  }

  public getGameRooms(): Observable<GameRoom[]>{
    return this.httpService.get(`/lobby/rooms`);
  }
  leave(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.stompSubscriptions.forEach(sub => sub.unsubscribe());
    this.stompSubscriptions = [];
  }

  joinToRoom(roomId: number): Observable<number> {
    const joinMessage = {
      user: { username: this.authenticationService.getUserFromLocalCache()?.username,
        isActive: true,
        role: "",
        authorities: []
      },
      type: JoinType.CONNECTED,
      roomId: roomId,
      color: null
    };
    
    return this.httpService.post('/lobby/join-room', joinMessage);
  }

  join(callback: Function): void {
    const _this = this;
    this.socketClientService.connect();
    const connectEvent$ = this.socketClientService.connectEvent.subscribe((frame:any) => {
      _this.onConnect(frame);
      callback();
    });
    this.subscriptions.push(connectEvent$);
  }
  onConnect(frame:any):void {
    this.socketClientService.publish('/app/game/newUser', {});
    const sub1 = this.socketClientService.subscribe('/topic/gamepublic', (message:IMessage) => {
      this.newRoomEvent.emit(JSON.parse(message.body));
    });
    this.stompSubscriptions.push(sub1);
  }
}
