import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalystActivityComponent } from './catalyst-activity.component';

describe('CatalystActivityComponent', () => {
  let component: CatalystActivityComponent;
  let fixture: ComponentFixture<CatalystActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalystActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalystActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
