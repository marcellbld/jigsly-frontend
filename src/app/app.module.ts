import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './core/header/header.component';
import { LoginModule } from './login/login.module';
import { RegisterModule } from './register/register.module';
import { CreateGameRoomModule } from './create-game-room/create-game-room.module';
import { GameRoomModule } from './game-room/game-room.module';
import { LobbyModule } from './lobby/lobby.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    CoreModule,
    SharedModule,
    LoginModule,
    RegisterModule,
    CreateGameRoomModule,
    GameRoomModule,
    LobbyModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
