import { Component,  OnDestroy,  OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameRoom } from '../shared/models/game-room';
import { AuthenticationService } from '../core/authentication/authentication.service';
import { LobbyService } from '../core/services/lobby.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../core/services/notification.service';
import { NotificationType } from '../shared/enum/notification-type.enum';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit, OnDestroy {

  public gameRooms: GameRoom[] = [];
  private subscriptions: Subscription[] = [];

  constructor(public authService: AuthenticationService,
    private lobbyService: LobbyService, private router: Router, private notificationService: NotificationService) {
  }
  public createRoom(): void {
      this.router.navigate([`/create-room`]);
  }

  public isLoggedIn():boolean{
    return this.authService.isUserLoggedIn();
  }
  
  ngOnDestroy(): void {
    this.lobbyService.leave();
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }
  ngOnInit(): void {
    
    this.lobbyService.join(() => {
      const sub1 = this.lobbyService.getGameRooms().subscribe({
        next: (rooms) => {this.gameRooms = rooms;}
      });
      const sub2 = this.lobbyService.newRoomEvent.subscribe({
        next: (room:GameRoom) => {this.gameRooms.push(room);}
      });
      this.subscriptions.push(sub1, sub2);
      this.notificationService.notify(NotificationType.SUCCESS, "Successfully connected to Lobby");
    });
    
  }
}
