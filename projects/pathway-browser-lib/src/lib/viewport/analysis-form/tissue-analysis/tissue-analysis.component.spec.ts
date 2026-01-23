import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TissueAnalysisComponent } from './tissue-analysis.component';

describe('TissueAnalysisComponent', () => {
  let component: TissueAnalysisComponent;
  let fixture: ComponentFixture<TissueAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TissueAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TissueAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
