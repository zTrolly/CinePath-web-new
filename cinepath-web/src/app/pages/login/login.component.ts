// src/app/components/login/login.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppService } from '../../services/appService';
import { emailValidator, passwordValidator } from '../../util/custom-validators'
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../../components/SimpleComponents/alert-dialog/alert-dialog.component';
import { from } from 'rxjs';

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
    private router: Router,
    private dialog: MatDialog
  ){}

  get email() {
    return this.credentials.get('email');
  }

  get password() {
    return this.credentials.get('password');
  }

  ngOnInit(): void {
    this.credentials = this.fb.group({
      email: ['', [Validators.required, emailValidator()]],
      password: ['', [Validators.required, passwordValidator()]]
    });

    this.createAccount = this.fb.group({
      email: ['', [Validators.required, emailValidator()]],
      password: ['', [Validators.required, passwordValidator()]]
    });
  }

  changeLogin() {
    this.isLogin = !this.isLogin;
  }

  async register() {
    if (this.createAccount.valid) {
      const email = this.createAccount.get('email')?.value;
      const password = this.createAccount.get('password')?.value;
      if (email && password) {
        try {
          const success = await this.appService.registerUser(email, password);
          if (success) {
            this.router.navigateByUrl('home');
          } else {
            this.showAlert('Registration failed: Unable to register. Please try again.');
          }
        } catch (error) {
          this.showAlert('Registration failed: An unexpected error occurred. Please try again.');
        }
      } else {
        this.showAlert('Invalid input: Please provide valid email and password.');
      }
    } else {
      this.showAlert('Invalid input: Please provide valid email and password.');
    }
  }

  async login() {
    if (this.credentials.valid) {
      const email = this.credentials.get('email')?.value;
      const password = this.credentials.get('password')?.value;
      if (email && password) {
        try {
          const success = await this.appService.loginUser(email, password);
          if (success) {
            this.router.navigateByUrl('/tabs/tab1');
          } else {
            this.showAlert('Login falhou: Não foi possível fazer login. Por favor, verifique suas credenciais e tente novamente.')
          }
        } catch (error) {
          this.showAlert( 'Login falhou: Ocorreu um erro inesperado. Por favor, tente novamente.')
        }
      } else {
        this.showAlert('Entrada inválida: Por favor, forneça um email e senha válidos.');
      }
    } else {
      this.showAlert('Entrada inválida: Por favor, forneça um email e senha válidos.');
    }
  }

  handleLogin() {
    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }

  showAlert(message: string) {
    this.dialog.open(AlertDialogComponent, {
      data: { message }
    });
  }
}
