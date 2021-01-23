import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


  get email() { return this.form.get('email') as FormControl; }
  get password() { return this.form.get('password') as FormControl; }

  public form: FormGroup;
  public errorMessage: string;


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { }


  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', {
        validators: [
          Validators.required,
          Validators.email,
        ],
        updateOn: 'change'
      }],
      password: ['', {
        validators: [
          Validators.required,
        ],
        updateOn: 'change'
      }],
    })
  }


  submit() {
    this.errorMessage = null;

    this.authService.login({
      email: this.email.value,
      password: this.password.value,
    }).subscribe(
      response => this.router.navigate(['']),
      error => {
        this.errorMessage = 'Authentication failed';
      }
    );
  }
}
