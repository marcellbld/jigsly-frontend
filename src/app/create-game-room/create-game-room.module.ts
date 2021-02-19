import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateGameRoomComponent } from './create-game-room.component';
import { SharedModule } from '../shared/shared.module';
import { CreateGameRoomRoutingModule } from './create-game-room-routing.module';

@NgModule({
  declarations: [CreateGameRoomComponent],
  imports: [
    SharedModule,
    CreateGameRoomRoutingModule
  ]
})
export class CreateGameRoomModule { }
