import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectTreeComponent } from './object-tree.component';

describe('EntityTreeComponent', () => {
  let component: ObjectTreeComponent;
  let fixture: ComponentFixture<ObjectTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjectTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
