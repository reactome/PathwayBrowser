import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressionTabComponent } from './expression-tab.component';

describe('ExpressionComponent', () => {
  let component: ExpressionTabComponent;
  let fixture: ComponentFixture<ExpressionTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpressionTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpressionTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
