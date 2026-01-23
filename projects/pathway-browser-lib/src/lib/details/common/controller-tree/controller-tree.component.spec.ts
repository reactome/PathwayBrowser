import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControllerTreeComponent } from './controller-tree.component';

describe('ControllerTreeComponent', () => {
  let component: ControllerTreeComponent;
  let fixture: ComponentFixture<ControllerTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControllerTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControllerTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
