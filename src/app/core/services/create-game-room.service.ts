import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpService } from '../http/http.service';

@Injectable({
  providedIn: 'root'
})
export class CreateGameRoomService {

  public host = environment.apiUrl;
  
  constructor(private httpService: HttpService) {}
    
  public createRoom(data:Object): Observable<number> {
    return this.httpService.post("/lobby/create-room", data);
  }
  public getDefaultImages(): Observable<string[]>{
    return this.httpService.get("/resources/images/default-images");
  }
}
