import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventHierarchyComponent } from './event-hierarchy.component';

describe('EventHierarchyComponent', () => {
  let component: EventHierarchyComponent;
  let fixture: ComponentFixture<EventHierarchyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventHierarchyComponent]
    });
    fixture = TestBed.createComponent(EventHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
