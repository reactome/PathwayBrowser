import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisControlsComponent } from './analysis-controls.component';

describe('AnalysisControlsComponent', () => {
  let component: AnalysisControlsComponent;
  let fixture: ComponentFixture<AnalysisControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisControlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
