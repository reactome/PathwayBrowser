import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsTabComponent } from './details-tab.component';

describe('DetailsComponent', () => {
  let component: DetailsTabComponent;
  let fixture: ComponentFixture<DetailsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
