import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsTabOverviewComponent } from './details-tab-overview.component';

describe('OverviewBaseComponent', () => {
  let component: DetailsTabOverviewComponent;
  let fixture: ComponentFixture<DetailsTabOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsTabOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsTabOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
