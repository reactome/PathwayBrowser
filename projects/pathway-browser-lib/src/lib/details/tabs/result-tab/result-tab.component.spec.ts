import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultTabComponent } from './result-tab.component';

describe('ResultTabComponent', () => {
  let component: ResultTabComponent;
  let fixture: ComponentFixture<ResultTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
