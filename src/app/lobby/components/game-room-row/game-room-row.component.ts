import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameRoom } from 'src/app/shared/models/game-room';
import { DomSanitizer } from '@angular/platform-browser';
import { LobbyService } from 'src/app/core/services/lobby.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NotificationType } from 'src/app/shared/enum/notification-type.enum';

@Component({
  selector: 'app-game-room-row',
  templateUrl: './game-room-row.component.html',
  styleUrls: ['./game-room-row.component.css']
})
export class GameRoomRowComponent {

  @Input() public gameRoom: GameRoom | undefined;

  constructor(private router: Router, private sanitizer:DomSanitizer, private lobbyService: LobbyService, private notificationService: NotificationService) { }
  
  getThumbnailImage(){
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.gameRoom?.thumbnailBase64!);
  }

  public isFull():boolean {
    return this.gameRoom?.users.length! >= this.gameRoom?.maximumUsers!;
  }

  joinClick(): void {
      this.lobbyService.joinToRoom(this.gameRoom?.id!).subscribe({
        next: (response:any) => {
        this.router.navigate([`/room`, this.gameRoom?.id]);
        this.lobbyService.leave();
      }, error: (response:any) => {
        this.notificationService.notify(NotificationType.WARNING, response);
      }});
  }
}
