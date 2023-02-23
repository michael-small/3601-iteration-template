import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from './user';
import { UserService } from './user.service';
import { map, Observable, shareReplay, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent {

  id$: Observable<string> = this.route.paramMap.pipe(
    map((pmap) => pmap.get('id'))
  );
  user$: Observable<User> = this.id$.pipe(
  	switchMap((id) => this.userService.getUserById(id)),
    shareReplay(1) // allows multiple subscriptions without making multiple requests
  );

  constructor(private route: ActivatedRoute, private userService: UserService) { }

}
