import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GalleryComponent } from './gallery/gallery.component';
import { LightboxComponent } from './lightbox/lightbox.component';
import { NavbarComponent } from './navbar/navbar.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NgxFileDropModule } from 'ngx-file-drop';
import { ModalComponent } from './modal/modal.component';
import { CropComponent } from './crop/crop.component';
import { MygalleryComponent } from './mygallery/mygallery.component';





@NgModule({
  declarations: [
    AppComponent,
    GalleryComponent,
    LightboxComponent,
    NavbarComponent,
    ModalComponent,
    CropComponent,
    MygalleryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule,
    MatIconModule,
    NgxFileDropModule,
   
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
