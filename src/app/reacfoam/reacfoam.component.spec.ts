import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReacfoamComponent } from './reacfoam.component';

describe('ReacfoamComponent', () => {
  let component: ReacfoamComponent;
  let fixture: ComponentFixture<ReacfoamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReacfoamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReacfoamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
