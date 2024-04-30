import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { userInformationSidebar } from '@app/shared/utils/icons.utils';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TabsModule } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-user-information',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    FontAwesomeModule,
    TabsModule,
    RouterLink,
  ],
  templateUrl: './user-information.component.html',
  styleUrl: './user-information.component.scss',
})
export class UserInformationComponent {
  sidebarIcons = userInformationSidebar;
}
