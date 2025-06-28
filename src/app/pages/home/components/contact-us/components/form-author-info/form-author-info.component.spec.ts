import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAuthorInfoComponent } from './form-author-info.component';

describe('FormAuthorInfoComponent', () => {
  let component: FormAuthorInfoComponent;
  let fixture: ComponentFixture<FormAuthorInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAuthorInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAuthorInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
