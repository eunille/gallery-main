import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryComponent } from './gallery/gallery.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { MygalleryComponent } from './mygallery/mygallery.component';
const routes: Routes = [
  {
    path: '', component: LoginComponent,
  },
  {
    path: 'signup', component: SignupComponent,
  },
  // {
  //   path: 'gallery',
  //   component: GalleryComponent
  // },
  {
    path: 'login', component: LoginComponent,
  },
  {
    path: 'gallery',
    component: GalleryComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'mygallery',
    component: MygalleryComponent,
  },
  {
    path: '**',
    component: GalleryComponent
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
