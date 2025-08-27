import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShadowScrollComponent } from './shadow-scroll.component';

describe('ShadowScrollComponent', () => {
  let component: ShadowScrollComponent;
  let fixture: ComponentFixture<ShadowScrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShadowScrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShadowScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
