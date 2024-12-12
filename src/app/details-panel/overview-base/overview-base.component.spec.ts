import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewBaseComponent } from './overview-base.component';

describe('OverviewBaseComponent', () => {
  let component: OverviewBaseComponent;
  let fixture: ComponentFixture<OverviewBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewBaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
