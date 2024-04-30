import { Component } from '@angular/core';
import { BasicCardComponent } from '../../components/basic-card/basic-card.component';

@Component({
  selector: 'app-personal-information',
  standalone: true,
  imports: [BasicCardComponent],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss',
})
export class PersonalInformationComponent {}
