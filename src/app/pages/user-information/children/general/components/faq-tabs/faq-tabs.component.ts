// angular stuff
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';

@Component({
    selector: 'app-faq-tabs',
    imports: [CommonModule, TabsModule],
    templateUrl: './faq-tabs.component.html',
    styleUrl: './faq-tabs.component.scss'
})
export class FaqTabsComponent {}
