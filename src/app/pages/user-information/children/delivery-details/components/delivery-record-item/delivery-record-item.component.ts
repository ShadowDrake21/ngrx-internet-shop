// angular stuff
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

//interfaces
import { IShipping } from '@models/purchase.model';

// utils
import { changeDetailsIcons } from '@shared/utils/icons.utils';

@Component({
  selector: 'app-delivery-record-item',
  imports: [FontAwesomeModule],
  templateUrl: './delivery-record-item.component.html',
  styleUrl: './delivery-record-item.component.scss',
})
export class DeliveryRecordListComponent {
  readonly icons = changeDetailsIcons;

  @Input({ required: true }) record!: IShipping;
  @Input({ required: true }) removeActive!: boolean;

  @Output() recordRemove: EventEmitter<string> = new EventEmitter<string>();
  @Output() recordEdit: EventEmitter<string> = new EventEmitter<string>();

  get formattedBgUrl(): string {
    return `url(${this.record.background?.url || ''})`;
  }
}
