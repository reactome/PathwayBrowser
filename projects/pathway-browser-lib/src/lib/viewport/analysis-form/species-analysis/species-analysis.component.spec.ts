import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesAnalysisComponent } from './species-analysis.component';

describe('SpeciesAnalysisComponent', () => {
  let component: SpeciesAnalysisComponent;
  let fixture: ComponentFixture<SpeciesAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeciesAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpeciesAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
