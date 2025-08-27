import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RheaComponent } from './rhea.component';

describe('RheaComponent', () => {
  let component: RheaComponent;
  let fixture: ComponentFixture<RheaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RheaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RheaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
