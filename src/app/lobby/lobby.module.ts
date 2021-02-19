import { NgModule } from '@angular/core';
import { LobbyComponent } from './lobby.component';
import { SharedModule } from '../shared/shared.module';
import { GameRoomRowComponent } from './components/game-room-row/game-room-row.component';
import { LobbyRoutingModule } from './lobby-routing.module';

@NgModule({
  declarations: [LobbyComponent, GameRoomRowComponent],
  imports: [
    SharedModule,
    LobbyRoutingModule
  ]
})
export class LobbyModule { }
