import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewportComponent } from './viewport.component';

describe('ViewportComponent', () => {
  let component: ViewportComponent;
  let fixture: ComponentFixture<ViewportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewportComponent]
    });
    fixture = TestBed.createComponent(ViewportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
