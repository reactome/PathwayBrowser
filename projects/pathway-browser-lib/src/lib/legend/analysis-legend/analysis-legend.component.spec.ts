import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisLegendComponent } from './analysis-legend.component';

describe('AnalysisControlsComponent', () => {
  let component: AnalysisLegendComponent;
  let fixture: ComponentFixture<AnalysisLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisLegendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
