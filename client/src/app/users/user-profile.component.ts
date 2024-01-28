import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from './user';
import { UserService } from './user.service';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { UserCardComponent } from './user-card.component';

import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [UserCardComponent, MatCardModule],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: User;
  error: { help: string; httpResponse: string; message: string };

  // This `Subject` will only ever emit one (empty) value when
  // `ngOnDestroy()` is called, i.e., when this component is
  // destroyed. That can be used ot tell any subscriptions to
  // terminate, allowing the system to free up their resources (like memory).
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private userService: UserService
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
        takeUntil(this.ngUnsubscribe)
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

  // TODO - add comments back
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
