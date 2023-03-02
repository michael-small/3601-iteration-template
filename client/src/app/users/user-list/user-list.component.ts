import { Component, Input } from '@angular/core';
import { User } from '../user';

/**
 * A component that displays a list of users, either as a grid
 * of cards or as a vertical list.
 */
@Component({
  selector: 'app-user-list-component',
  templateUrl: 'user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: []
})

export class UserListComponent  {
  @Input() filteredUsers: User[];
  public viewType: 'card' | 'list' = 'card';
}
