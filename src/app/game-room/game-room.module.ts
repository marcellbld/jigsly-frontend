import { NgModule } from '@angular/core';
import { GameRoomComponent } from './game-room.component';
import { SharedModule } from '../shared/shared.module';
import { GameRoomRoutingModule } from './game-room-routing.module';

@NgModule({
  declarations: [GameRoomComponent],
  imports: [
    SharedModule,
    GameRoomRoutingModule
  ]
})
export class GameRoomModule { }
