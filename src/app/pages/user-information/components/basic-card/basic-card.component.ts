// angular stuff
import { NgOptimizedImage } from '@angular/common';
import { Component, Input } from '@angular/core';

// content
import { IUserInformationContentItem } from '../../content/user-information.content';

@Component({
  selector: 'app-basic-card',
  imports: [NgOptimizedImage],
  templateUrl: './basic-card.component.html',
  styleUrl: './basic-card.component.scss',
})
export class BasicCardComponent {
  @Input({ required: true }) data!: IUserInformationContentItem;
}
