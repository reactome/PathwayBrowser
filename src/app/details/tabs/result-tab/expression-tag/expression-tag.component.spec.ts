import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressionTagComponent } from './expression-tag.component';

describe('ExpressionTagComponent', () => {
  let component: ExpressionTagComponent;
  let fixture: ComponentFixture<ExpressionTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpressionTagComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpressionTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
