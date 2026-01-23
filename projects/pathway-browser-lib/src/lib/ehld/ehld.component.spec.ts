import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EhldComponent } from './ehld.component';

describe('EhldComponent', () => {
  let component: EhldComponent;
  let fixture: ComponentFixture<EhldComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EhldComponent]
    });
    fixture = TestBed.createComponent(EhldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
