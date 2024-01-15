import { Component, Input } from '@angular/core';
import { User } from './user';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';


@Component({
    selector: 'app-user-card',
    templateUrl: './user-card.component.html',
    styleUrls: ['./user-card.component.scss'],
    standalone: true,
    imports: [MatCardModule, MatButtonModule, RouterLink]
})
export class UserCardComponent {

  @Input() user: User;
  @Input() simple?: boolean = false;

}
