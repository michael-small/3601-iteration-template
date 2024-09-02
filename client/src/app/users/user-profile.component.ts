import { Component, DestroyRef, Signal, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { User } from './user';
import { UserCardComponent } from './user-card.component';
import { UserService } from './user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    standalone: true,
    imports: [UserCardComponent, MatCardModule]
})
export class UserProfileComponent {
  error = signal<{ help: string, httpResponse: string, message: string } | undefined>(undefined);

  // This `Subject` will only ever emit one (empty) value when
  // `ngOnDestroy()` is called, i.e., when this component is
  // destroyed. That can be used ot tell any subscriptions to
  // terminate, allowing the system to free up their resources (like memory).

  constructor(private snackBar: MatSnackBar, private route: ActivatedRoute, private userService: UserService, private destroyRef: DestroyRef) { }

    // `map` and `switchMap` are RXJS operators, and
    // each represents a step in the pipeline built using the RXJS `pipe`
    // operator.
    // The map step takes the `ParamMap` from the `ActivatedRoute`, which
    // is typically the URL in the browser bar.
    // The result from the map step is the `id` string for the requested
    // `User`.
    // That ID string gets passed (by `pipe`) to `switchMap`, which transforms
    // it into an Observable<User>, i.e., all the (zero or one) `User`s
    // that have that ID.
    user: Signal<User | undefined> = toSignal(
        this.route.paramMap.pipe(
            // Map the paramMap into the id
            map((paramMap: ParamMap) => paramMap.get('id')),
            // Maps the `id` string into the Observable<User>,
            // which will emit zero or one values depending on whether there is a
            // `User` with that ID.
            switchMap((id: string) => this.userService.getUserById(id)),
            catchError(_err => {
                this.error.set( {
                    help: 'There was a problem loading the user – try again.',
                    httpResponse: _err.message,
                    message: _err.error?.title,
                })
                // Something has to be returned to keep the shape of the user right
                // `of` just says something should be treated as an observable
                // You can use `of` elsewhere to mock out a value as an observable
                return of<undefined>()
            }),
            /*
            * You can uncomment the line that starts with `finalize` below to use that console message
            * as a way of verifying that this subscription is completing.
            * We removed it since we were not doing anything interesting on completion
            * and didn't want to clutter the console log
            */
            finalize(() => console.log('We got a new user, and we are done!'))
        ),
    )
}
