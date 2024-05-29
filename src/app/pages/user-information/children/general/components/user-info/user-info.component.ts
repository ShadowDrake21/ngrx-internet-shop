// angular stuff
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

// interfaces
import { IUser } from '@models/user.model';

// pipes
import { TruncateTextPipe } from '@shared/pipes/truncate-text.pipe';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule, TruncateTextPipe],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent {
  @Input({ alias: 'user', required: true }) user$!: Observable<IUser | null>;
}
