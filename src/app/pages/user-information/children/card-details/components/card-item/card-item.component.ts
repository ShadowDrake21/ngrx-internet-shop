// angular stuff
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// interfaces
import { ICard } from '@models/card.model';

// utils
import { changeDetailsIcons } from '@shared/utils/icons.utils';

@Component({
  selector: 'app-card-item',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './card-item.component.html',
  styleUrl: './card-item.component.scss',
})
export class CardItemComponent {
  icons = changeDetailsIcons;

  @Input({ required: true }) card!: ICard;
  @Input({ required: true }) removeActive!: boolean;

  @Output() cardRemove: EventEmitter<string> = new EventEmitter<string>();
  @Output() cardEdit: EventEmitter<string> = new EventEmitter<string>();
}
