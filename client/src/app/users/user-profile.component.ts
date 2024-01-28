import {
  Component,
  OnInit,
  OnDestroy,
  DestroyRef,
  input,
  computed,
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from './user';
import { UserService } from './user.service';
import { Subject, of } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { UserCardComponent } from './user-card.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [UserCardComponent, MatCardModule, JsonPipe, AsyncPipe],
})
export class UserProfileComponent implements OnInit {
  user: User;
  error: { help: string; httpResponse: string; message: string };

  $id = input<string>('', { alias: 'id' });
  $user = computed(() => {
    return this.userService.getUserById(this.$id()).pipe(
      catchError((_err) =>
        of({
          help: 'There was a problem loading the user – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        })
      )
    );
  });

  constructor(
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private userService: UserService,
    private destroy: DestroyRef
  ) {}

  // TODO - add comments back
  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((paramMap: ParamMap) => {
          console.log(paramMap);
          return paramMap.get('id');
        }),
        switchMap((id: string) => this.userService.getUserById(id)),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe({
        next: (user) => {
          this.user = user;
          return user;
        },
        error: (_err) => {
          this.error = {
            help: 'There was a problem loading the user – try again.',
            httpResponse: _err.message,
            message: _err.error?.title,
          };
        },
        // complete: () => console.log('We got a new user, and we are done!'),
      });
  }
}
