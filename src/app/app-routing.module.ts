import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryComponent } from './gallery/gallery.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    component: GalleryComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  // {
  //   path: 'gallery',
  //   component: GalleryComponent
  // },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '**',
    component: GalleryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
