import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AccordionModule } from 'ngx-bootstrap/accordion';

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [CommonModule, AccordionModule],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
})
export class GeneralComponent {}
