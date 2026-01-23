import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFoundTableComponent } from './not-found-table.component';

describe('NotFoundTableComponent', () => {
  let component: NotFoundTableComponent;
  let fixture: ComponentFixture<NotFoundTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotFoundTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
