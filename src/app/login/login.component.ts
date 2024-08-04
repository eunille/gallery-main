import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataserviceService } from '../services/dataservice.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  hidePassword: boolean = true;
  email: any;
  password: any;
  loginPrompt: string = '';

  constructor(
    private router: Router,
    private ds: DataserviceService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  async login() {
    const userInfo = {
      email: this.email,
      password: this.password
    };
  
    this.ds.sendApiRequest("login", userInfo).subscribe(async (res: any) => {
      if (res.payload == null) {
        // Use SweetAlert2 for incorrect credentials
        await Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Incorrect credentials. Please try again.',
          confirmButtonText: 'OK'
        });
      } else {
        localStorage.setItem("email", res.payload.email);
        localStorage.setItem("user_id", res.payload.user_id);
        localStorage.setItem("username", res.payload.username); // Store user's name
        
        this.router.navigate(["/gallery"]);
        // Use SweetAlert2 for successful login
        await Swal.fire({
          icon: 'success',
          title: 'Successfully Login', 
          text: `Welcome, ${localStorage.getItem("username")}!`,
          confirmButtonText: 'OK'
        });
  
        
      }
    });
  }
  

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSignup(): void {
    this.router.navigate(['/signup']); // Navigate to the register component/page
  }
}
