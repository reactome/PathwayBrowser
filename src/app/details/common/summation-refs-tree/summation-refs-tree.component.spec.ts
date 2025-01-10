import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummationRefsTreeComponent } from './summation-refs-tree.component';

describe('TreeComponent', () => {
  let component: SummationRefsTreeComponent;
  let fixture: ComponentFixture<SummationRefsTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummationRefsTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummationRefsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
