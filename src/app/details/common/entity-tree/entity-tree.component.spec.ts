import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTreeComponent } from './entity-tree.component';

describe('EntityTreeComponent', () => {
  let component: EntityTreeComponent;
  let fixture: ComponentFixture<EntityTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
