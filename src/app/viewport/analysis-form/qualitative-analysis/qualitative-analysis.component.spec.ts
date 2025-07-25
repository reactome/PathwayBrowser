import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualitativeAnalysisComponent } from './qualitative-analysis.component';

describe('QualitativeComponent', () => {
  let component: QualitativeAnalysisComponent;
  let fixture: ComponentFixture<QualitativeAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualitativeAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualitativeAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
