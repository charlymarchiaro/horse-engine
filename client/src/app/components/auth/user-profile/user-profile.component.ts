import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormGroupDirective, NgForm, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '../../../services/auth/auth.service';
import { generateAvatarImageUrl } from '../../../services/utils/user-avatar-generator';
import { Subscription } from 'rxjs';



// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup): null | ValidationErrors => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    // return null if controls haven't initialised yet
    if (!control || !matchingControl) {
      return null;
    }

    // return null if another validator has already found an error on the matchingControl
    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      return null;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  }
}


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {

  public user: User;

  public avatarImgUrl: string;

  get password1() { return this.changePasswordForm.get('password1') as FormControl; }
  get password2() { return this.changePasswordForm.get('password2') as FormControl; }

  public changePasswordForm: FormGroup;
  public changePasswordErrorMessage: string;

  public isChangingPassword: boolean;

  private subscription = new Subscription();


  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.subscription.add(
      authService.loggedUser$.subscribe(u => {
        this.user = u;
        if (!u) {
          return;
        }

        this.avatarImgUrl = generateAvatarImageUrl(
          u.firstName,
          u.lastName,
          96
        );
      }
      )
    );
  }


  ngOnInit(): void {
    this.changePasswordForm = this.fb.group({
      password1: ['', {
        validators: [
          Validators.required,
          Validators.minLength(8),
        ],
        updateOn: 'change'
      }],
      password2: ['', {
        updateOn: 'change'
      }]
    },
      { validators: MustMatch('password1', 'password2') }
    );
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.snackBar.ngOnDestroy();
  }


  submitPasswordChange() {
    this.isChangingPassword = true;
    this.changePasswordErrorMessage = null;

    this.authService.changePassword(this.password1.value).subscribe(
      response => {
        this.isChangingPassword = false;
        this.password1.reset();
        this.password2.reset();

        this.snackBar.open(
          `Password changed`,
          'Close',
          { duration: 3000 }
        );
      },
      error => {
        this.isChangingPassword = false;
        this.password1.reset();
        this.password2.reset();

        this.changePasswordErrorMessage = 'Password change failed'
      }
    )
  }
}
