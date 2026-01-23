import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockingLoaderComponent } from './blocking-loader.component';

describe('BlockingLoaderComponent', () => {
  let component: BlockingLoaderComponent;
  let fixture: ComponentFixture<BlockingLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockingLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockingLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
