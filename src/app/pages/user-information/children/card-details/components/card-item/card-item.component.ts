import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICard } from '@app/shared/models/card.model';
import { changeDetailsIcons } from '@app/shared/utils/icons.utils';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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

  @Output() cardRemove: EventEmitter<string> = new EventEmitter<string>();
  @Output() cardEdit: EventEmitter<string> = new EventEmitter<string>();
}
