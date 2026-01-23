import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagButtonComponent } from './flag-button.component';

describe('FlagButtonComponent', () => {
  let component: FlagButtonComponent;
  let fixture: ComponentFixture<FlagButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlagButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlagButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
