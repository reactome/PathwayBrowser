import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractorsTableComponent } from './interactors-table.component';

describe('InteractorsTableComponent', () => {
  let component: InteractorsTableComponent;
  let fixture: ComponentFixture<InteractorsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractorsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractorsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
