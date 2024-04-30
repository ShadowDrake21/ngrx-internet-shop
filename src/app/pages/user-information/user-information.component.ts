import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { userInformationSidebar } from '@app/shared/utils/icons.utils';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-user-information',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './user-information.component.html',
  styleUrl: './user-information.component.scss',
})
export class UserInformationComponent {
  sidebarIcons = userInformationSidebar;
}
