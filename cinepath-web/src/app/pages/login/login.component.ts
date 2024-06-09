import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../services/appService';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  credentials!: FormGroup;
  createAccount!: FormGroup;
  isLogin = true;

  constructor(
    private fb: FormBuilder, 
    private appService: AppService, 
    private router: Router
  ){}

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  ngOnInit(): void {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.createAccount = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  changeLogin() {
    this.isLogin = !this.isLogin;
  }

  async register() {
    if (this.createAccount.valid) {
      console.log('Register')
      const email = this.createAccount.get('email')?.value;
      const password = this.createAccount.get('password')?.value;
      console.log('Register - Email:', email, 'Password:', password); // Depuração
      if (email && password) {
        try {
          const success = await this.appService.registerUser(email, password);
          
          if (success) {
            this.router.navigateByUrl('home');
          } else {
            console.error('Registration failed', 'Unable to register. Please try again.');
          }
        } catch (error) {
          
          console.error('Registration failed', 'An unexpected error occurred. Please try again.');
        }
      } else {
        
        console.error('Invalid input', 'Please provide valid email and password.');
      }
    } else {
      
      console.error('Invalid input', 'Please provide valid email and password.');
    }
  }

  async login() {

    if (this.credentials.valid) {
      const email = this.credentials.get('email')?.value;
      const password = this.credentials.get('password')?.value;
      console.log('Login - Email:', email, 'Password:', password); // Depuração
      if (email && password) {
        try {
          const success = await this.appService.loginUser(email, password);
          if (success) {
            this.router.navigateByUrl('/tabs/tab1');
          } else {
            console.error('Login failed', 'Unable to login. Please check your credentials and try again.');
          }
        } catch (error) {
          
          console.error('Login failed', 'An unexpected error occurred. Please try again.');
        }
      } else {
        
        console.error('Invalid input', 'Please provide valid email and password.');
      }
    } else {
      
      console.error('Invalid input', 'Please provide valid email and password.');
    }
  }

  handleLogin() {
    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }


}
