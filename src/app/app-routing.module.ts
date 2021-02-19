import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';


const routes: Routes = [
  { path: 'login', 
  loadChildren: './login/login.module#LoginModule'  },
  { path: 'register', 
  loadChildren: './register/register.module#RegisterModule'  },
  { path: 'create-room', 
loadChildren: './create-game-room/create-game-room.module#CreateGameRoomModule'},
  { path: 'lobby', 
    loadChildren: './lobby/lobby.module#LobbyModule'  },
  { path: 'room', 
    loadChildren: './game-room/game-room.module#GameRoomModule'
  },
  { path: '', redirectTo: 'lobby', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
