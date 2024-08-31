import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, of, switchMap, tap } from 'rxjs';
import { User, UserRole } from './user';
import { UserCardComponent } from './user-card.component';
import { UserService } from './user.service';
import { AsyncPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

/**
 * A component that displays a list of users, either as a grid
 * of cards or as a vertical list.
 *
 * The component supports local filtering by name and/or company,
 * and remote filtering (i.e., filtering by the server) by
 * role and/or age. These choices are fairly arbitrary here,
 * but in "real" projects you want to think about where it
 * makes the most sense to do the filtering.
 */
@Component({
    selector: 'app-user-list-component',
    templateUrl: 'user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    providers: [],
    standalone: true,
    imports: [AsyncPipe, MatCardModule, MatFormFieldModule, MatInputModule, FormsModule, MatSelectModule, MatOptionModule, MatRadioModule, UserCardComponent, MatListModule, RouterLink, MatButtonModule, MatTooltipModule, MatIconModule]
})
export class UserListComponent {
    $userName = signal<string | undefined>(undefined)
    $userAge = signal<number | undefined>(undefined)
    $userRole = signal<UserRole | undefined>(undefined)
    $userCompany = signal<string | undefined>(undefined)

    $viewType = signal<'card' | 'list'>('card');

    $errMsg = signal<string | undefined>(undefined);

    /**
     * This constructor injects both an instance of `UserService`
     * and an instance of `MatSnackBar` into this component.
     * `UserService` lets us interact with the server.
     *
     * @param userService the `UserService` used to get users from the server
     * @param snackBar the `MatSnackBar` used to display feedback
     */
    constructor(private userService: UserService, private snackBar: MatSnackBar) {
        // Nothing here – everything is in the injection parameters.
    }


    // Observable stuff needs observables to react to - just `toObservable` what is needed
    userRole$ = toObservable(this.$userRole)
    userAge$ = toObservable(this.$userAge)

    // We ultimately `toSignal` this to be able to access it synchronously, but we do all the RXJS operations internally
    //     Once there is a value for both the role and age, the latest values will move onto the switchMap
    $serverFilteredUsers = toSignal(combineLatest([this.userRole$, this.userAge$]).pipe(
        // You are now switching into another observable and mapping the previous values into the new one's args
        switchMap(([role, age]) => this.userService.getUsers({
            role,
            age
        })
        )).pipe(
            catchError((err) => {
                if (err.error instanceof ErrorEvent) {
                    this.$errMsg.set(`Problem in the client – Error: ${err.error.message}`);
                } else {
                    this.$errMsg.set( `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`)
                }
                this.snackBar.open(
                    this.$errMsg(),
                    'OK',
                    { duration: 6000 });
                // `catchError` needs to return the same type. `of` makes an observable of the same type, and makes the array still empty
                return of<User[]>([])
            }),
            // Tap does side effects
            tap(() => {
                console.log('Users were filtered on the server')
            })
        ))

    // No need for fancy RXJS stuff. We do fancy RXJS stuff in one spot then `toSignal` it.
    $filteredUsers = computed(() => {
        const serverFilteredUsers = this.$serverFilteredUsers()
        if (serverFilteredUsers.length > 0) {
            return this.userService.filterUsers(serverFilteredUsers, { name: this.$userName(), company: this.$userCompany() })
        } else {
            return [];
        }
    })
}
