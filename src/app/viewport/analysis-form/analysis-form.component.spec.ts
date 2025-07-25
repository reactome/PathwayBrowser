import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalysisFormComponent } from './analysis-form.component';

describe('AnalysisFormComponent', () => {
  let component: AnalysisFormComponent;
  let fixture: ComponentFixture<AnalysisFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalysisFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
