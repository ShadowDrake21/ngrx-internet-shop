// angular stuff
import { Component } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-faq-tabs',
  imports: [TabsModule],
  templateUrl: './faq-tabs.component.html',
  styleUrl: './faq-tabs.component.scss',
})
export class FaqTabsComponent {}
