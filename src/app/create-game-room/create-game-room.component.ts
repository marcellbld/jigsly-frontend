import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CreateGameRoomService } from 'src/app/core/services/create-game-room.service';
import { FormBuilder } from '@angular/forms';
import { NotificationType } from '../shared/enum/notification-type.enum';
import { isNumber } from 'lodash';
import { NotificationService } from '../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-game-room',
  templateUrl: './create-game-room.component.html',
  styleUrls: ['./create-game-room.component.css']
})
export class CreateGameRoomComponent implements OnInit {

  public defaultImages: string[] | undefined;
  public customImage: File | undefined;
  public customImageUrl: string | undefined;

  constructor(private createGameRoomService:CreateGameRoomService, private sanitizer: DomSanitizer, private notificationService: NotificationService, private router: Router) { }

  ngOnInit(): void {
    this.createGameRoomService.getDefaultImages().subscribe((data:string[]) => {
      this.defaultImages = data;
    });
  }
  
  public onSubmit(data:any):void {    
    const formData = data;
    let base64Image = null;
    let width = 0;
    let height = 0;

    if(formData.selectedImage != -1){
      formData.customImage = null;
    }
    else {
       base64Image = this.customImageUrl;
       let img = new Image();
       img.src = base64Image!;

       width = img.width;
       height = img.height;
    }

    this.createGameRoomService.createRoom({
      maximum: formData.maximum, 
      pieces: formData.pieces, 
      customImage: base64Image, 
      selectedImage: formData.selectedImage, 
      width: width,
      height: height
    }).subscribe(
      data => {
        if(data && isNumber(data)){
          this.notificationService.notify(NotificationType.SUCCESS, "Room has been created successfully!");
          this.router.navigate([`/lobby`]);
        }
    });
  }

  public convertBase64Image(base64:string){
    return this.sanitizer.bypassSecurityTrustResourceUrl(base64);
  }

  public onCustomImageChange(files:FileList|undefined|null):void {
    if(files){
      this.customImage = files[0];
      if(!this.customImage)
        return;
      
      const reader = new FileReader();
      reader.readAsDataURL(this.customImage);

      reader.onload = event => {
        this.customImageUrl = reader.result?.toString();
      };
      reader.onloadend = () => {
        reader.readAsDataURL(this.customImage!);
      }
    }
  }

}
