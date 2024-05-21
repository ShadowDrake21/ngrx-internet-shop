import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IUserInformationContentItem } from '../../content/user-information.content';

@Component({
  selector: 'app-basic-card',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './basic-card.component.html',
  styleUrl: './basic-card.component.scss',
})
export class BasicCardComponent {
  @Input({ required: true }) item!: IUserInformationContentItem;
}
