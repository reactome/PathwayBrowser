import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractorsComponent } from './interactors.component';

describe('InteractorsComponent', () => {
  let component: InteractorsComponent;
  let fixture: ComponentFixture<InteractorsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InteractorsComponent]
    });
    fixture = TestBed.createComponent(InteractorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
