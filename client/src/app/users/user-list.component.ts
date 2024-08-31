import { Component, computed, effect, signal } from '@angular/core';
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
import { User, UserRole } from './user';
import { UserCardComponent } from './user-card.component';
import { UserService } from './user.service';
import { AsyncPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';

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

    // We ultimately `toSignal` this to be able to access it synchronously, but we do all the RXJS operations internally
    //     Once there is a value for both the role and age, the latest values will move onto the switchMap
    $serverFilteredUsers = signal<User[]>([])

    /**
     * This constructor injects both an instance of `UserService`
     * and an instance of `MatSnackBar` into this component.
     * `UserService` lets us interact with the server.
     *
     * @param userService the `UserService` used to get users from the server
     * @param snackBar the `MatSnackBar` used to display feedback
     */
    constructor(private userService: UserService, private snackBar: MatSnackBar) {
        effect(async () => {
            if (this.$userRole() || this.$userAge()) {
                try {
                    await firstValueFrom(this.userService.getUsers({ role: this.$userRole(), age: this.$userAge() }))
                } catch (err) {
                    if (err.error instanceof ErrorEvent) {
                        this.$errMsg.set(`Problem in the client – Error: ${err.error.message}`);
                    } else {
                        this.$errMsg.set( `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`)
                    }
                    this.snackBar.open(
                        this.$errMsg(),
                        'OK',
                        { duration: 6000 });
                }
            }
        })
    }

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
