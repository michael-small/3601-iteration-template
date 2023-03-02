import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { User, UserRole } from '../user';
import { UserService } from '../user.service';

/**
 * The component supports:
 *  - local filtering (i.e., filtering by the client) by name and/or company,
 *  - remote filtering (i.e., filtering by the server) by role and/or age.
 * These choices are fairly arbitrary here,
 * but in "real" projects you want to think about where it
 * makes the most sense to do each kind of filtering.
 */
@Component({
  selector: 'app-user-filter',
  templateUrl: './user-filter.component.html',
  styleUrls: ['./user-filter.component.scss']
})

export class UserFilterComponent implements OnInit, OnDestroy {
  @Output() filteredUsersChange = new EventEmitter<User[]>();
  @Input() filteredUsers: User[];
  targetUserName: string;
  targetUserAge: number;
  targetUserRole: UserRole;
  targetUserCompany: string;

  private serverFilteredUsers: User[];
  private ngUnsubscribe = new Subject<void>();

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

  ngOnInit(): void {
    this.getUsersFromServer();
  }

  /**
   * Get the users from the server, filtered by the role and age specified
   * in the GUI.
   */
  getUsersFromServer(): void {
    // A user-list-component is paying attention to userService.getUsers
    // (which is an Observable<User[]>)
    // (for more on Observable, see: https://reactivex.io/documentation/observable.html)
    // and we are specifically watching for role and age whenever the User[] gets updated
    this.userService.getUsers({
      role: this.targetUserRole,
      age: this.targetUserAge
    }).pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe({
      // Next time we see a change in the Observable<User[]>,
      // refer to that User[] as returnedUsers here and do the steps in the {}
      next: (returnedUsers) => {
        // First, update the array of serverFilteredUsers to be the User[] in the observable
        this.serverFilteredUsers = returnedUsers;
        // Then update the filters for our client-side filtering as described in this method
        this.updateFilter();
      },
      // If we observe an error in that Observable, put that message in a snackbar so we can learn more
      error: (err) => {
        let message = '';
        if (err.error instanceof ErrorEvent) {
          message = `Problem in the client – Error: ${err.error.message}`;
        } else {
          message = `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`;
        }
        this.snackBar.open(
          message,
          'OK',
          // The message will disappear after 6 seconds.
          { duration: 6000 });
      },
      // Once the observable has completed successfully
      // complete: () => console.log('Users were filtered on the server')
    });
  }

  public updateFilter(): void {
    this.filteredUsers = this.userService.filterUsers(
      this.serverFilteredUsers, { name: this.targetUserName, company: this.targetUserCompany });
    console.log(this.filteredUsers);
    this.filteredUsersChange.emit(this.filteredUsers);
  }

  /**
   * When this component is destroyed, we should unsubscribe to any
   * outstanding requests.
   */
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
