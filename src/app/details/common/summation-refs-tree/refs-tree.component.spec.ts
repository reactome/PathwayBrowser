import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefsTreeComponent } from './refs-tree.component';

describe('TreeComponent', () => {
  let component: RefsTreeComponent;
  let fixture: ComponentFixture<RefsTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefsTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
