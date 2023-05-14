import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallQueueUiComponent } from './call-queue-ui.component';

describe('CallQueueUiComponent', () => {
  let component: CallQueueUiComponent;
  let fixture: ComponentFixture<CallQueueUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallQueueUiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallQueueUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
