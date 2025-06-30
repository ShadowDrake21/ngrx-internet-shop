import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCustomerInformationComponent } from './edit-customer-information.component';

describe('EditCustomerInformationComponent', () => {
  let component: EditCustomerInformationComponent;
  let fixture: ComponentFixture<EditCustomerInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCustomerInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCustomerInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
