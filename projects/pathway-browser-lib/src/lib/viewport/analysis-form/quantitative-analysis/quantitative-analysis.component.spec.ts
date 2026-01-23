import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantitativeAnalysisComponent } from './quantitative-analysis.component';

describe('QuantitativeAnalysisComponent', () => {
  let component: QuantitativeAnalysisComponent;
  let fixture: ComponentFixture<QuantitativeAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuantitativeAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantitativeAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
