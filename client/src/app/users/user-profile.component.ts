import { Component, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from './user';
import { UserService } from './user.service';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { UserCardComponent } from './user-card.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [UserCardComponent, MatCardModule, AsyncPipe],
})
export class UserProfileComponent {
  user: User;
  error: { help: string; httpResponse: string; message: string };

  exampleAsyncPipeAccessProperty = '{{ (user$ | async).name }}';

  $user = toSignal(
    this.route.paramMap.pipe(
      map((paramMap: ParamMap) => {
        return paramMap.get('id');
      }),
      switchMap((id: string) => this.userService.getUserById(id)),
      tap(() => console.log('We got a new user, and we are done!')),
      catchError((_err) => {
        this.error = {
          help: 'There was a problem loading the user – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        };
        return of<User>(undefined);
      }),
      takeUntilDestroyed(this.destroy)
    )
  );

  user$ = this.route.paramMap.pipe(
    map((paramMap: ParamMap) => {
      return paramMap.get('id');
    }),
    switchMap((id: string) => this.userService.getUserById(id)),
    tap(() => console.log('We got a new user, and we are done!')),
    catchError((_err) => {
      this.error = {
        help: 'There was a problem loading the user – try again.',
        httpResponse: _err.message,
        message: _err.error?.title,
      };
      return of<User>(undefined);
    }),
    takeUntilDestroyed(this.destroy)
  );

  constructor(
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private userService: UserService,
    private destroy: DestroyRef
  ) {}
}
