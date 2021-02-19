import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CreateGameRoomComponent } from './create-game-room.component';
import { AuthenticationGuard } from '../core/guards/authentication.guard';

const routes: Routes = [
  {
    path: '',
    component: CreateGameRoomComponent,
    canActivate: [AuthenticationGuard],
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateGameRoomRoutingModule { }
