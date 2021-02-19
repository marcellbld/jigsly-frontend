import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { IMessage, StompSubscription } from '@stomp/stompjs';
import { Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { JoinType } from '../../shared/enum/join-type.enum';
import { GameRoom } from '../../shared/models/game-room';
import { JoinMessage } from '../../shared/models/join-message';
import { PieceAttachMessage } from '../../shared/models/piece-attach-message';
import { PieceMoveMessage } from '../../shared/models/piece-move-message';
import { Puzzle } from '../../shared/models/puzzle';
import { SocketClientService } from '../ws/socket-client.service';
import { throttle } from 'lodash-es';
import { HttpService } from '../http/http.service';

@Injectable({
  providedIn: 'root',
})
export class GameRoomService {

  public host = environment.apiUrl;
  private roomId: number | null = null;

  private stompSubscriptions : StompSubscription[] = [];

  private sendMoveMessageThrottle = throttle(this.sendMoveMessage, 50, {});
  
  @Output() public playerJoinedEvent: EventEmitter<JoinMessage> = new EventEmitter();
  @Output() public pieceMoveEvent: EventEmitter<PieceMoveMessage> = new EventEmitter();
  @Output() public pieceAttachEvent: EventEmitter<PieceAttachMessage> = new EventEmitter();

  constructor(private socketClientService: SocketClientService, private httpService: HttpService) { 
  }

  leave(roomId:number|null){
    this.socketClientService.publish(`/app/game/join`, { 
      user: null,
      roomId: roomId,
      type: JoinType.DISCONNECTED
    });
    this.stompSubscriptions.forEach(sub => sub.unsubscribe());
    this.stompSubscriptions = [];
  }
  join(roomId:number): void{
    this.roomId = roomId;
    const _this = this;
    const sub1 = this.socketClientService.subscribe('/topic/game/'+roomId+"/join", (message:IMessage) => {
      _this.playerJoinedEvent.emit(JSON.parse(message.body));
    });
    const sub2 = this.socketClientService.subscribe('/topic/game/'+roomId+"/attach", (message:IMessage) => {
      _this.pieceAttachEvent.emit(JSON.parse(message.body));
    });
    const sub3 = this.socketClientService.subscribe('/topic/game/'+roomId+"/move", (message:IMessage) => {
      _this.pieceMoveEvent.emit(JSON.parse(message.body));
    });

    this.stompSubscriptions.push(sub1, sub2, sub3);
    
    this.socketClientService.publish(`/app/game/join`, { 
      user: null,
      roomId: roomId,
      type: JoinType.CONNECTED
    });
  }
  public attachPiece(message: PieceAttachMessage):void{
   this.socketClientService.publish(`/app/game/piece/attach`, message);
  }

  private sendMoveMessage(message: PieceMoveMessage): void {
   this.socketClientService.publish(`/app/game/piece/move`, message);
  }

  public movePiece(message: PieceMoveMessage):void{
    this.sendMoveMessageThrottle(message);
  }

  public getPuzzle(): Observable<Puzzle>{
    return this.httpService.get(`/game/${this.roomId}/puzzle`)
  }
  
  public getGameRoom(): Observable<GameRoom>{
    return this.httpService.get(`/game/${this.roomId}`);
  }
}
