import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressionComponent } from './expression.component';

describe('ExpressionComponent', () => {
  let component: ExpressionComponent;
  let fixture: ComponentFixture<ExpressionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpressionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpressionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
