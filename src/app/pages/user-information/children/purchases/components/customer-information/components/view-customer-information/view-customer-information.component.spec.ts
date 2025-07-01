import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCustomerInformationComponent } from './view-customer-information.component';

describe('ViewCustomerInformationComponent', () => {
  let component: ViewCustomerInformationComponent;
  let fixture: ComponentFixture<ViewCustomerInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCustomerInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewCustomerInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
