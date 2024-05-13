import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IUser } from '@app/shared/models/user.model';
import { TruncateTextPipe } from '@app/shared/pipes/truncate-text.pipe';
import { Observable } from 'rxjs';

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
