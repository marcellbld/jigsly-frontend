import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearchPlus as fasSearchPlus, faSearchMinus as fasSearchMinus, 
  faPuzzlePiece as fasPuzzlePiece, faUser as fasUser, faKey as fasKey,
  faIdCard as fasIdCard, faEnvelope as fasEnvelope } from '@fortawesome/free-solid-svg-icons';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule,
    RouterModule
  ],
  declarations: [],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    HttpClientModule,
    RouterModule
  ]
})
export class SharedModule { 
  constructor(library: FaIconLibrary){
    library.addIcons(fasSearchPlus, fasSearchMinus, fasPuzzlePiece, fasUser, fasKey, fasIdCard, fasEnvelope);
  }
}
