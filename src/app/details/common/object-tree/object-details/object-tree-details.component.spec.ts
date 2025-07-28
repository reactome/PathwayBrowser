import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectTreeDetailsComponent } from './object-tree-details.component';

describe('EntityDetailsComponent', () => {
  let component: ObjectTreeDetailsComponent;
  let fixture: ComponentFixture<ObjectTreeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectTreeDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectTreeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
