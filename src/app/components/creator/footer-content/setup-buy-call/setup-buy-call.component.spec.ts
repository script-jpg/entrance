import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupBuyCallComponent } from './setup-buy-call.component';

describe('SetupBuyCallComponent', () => {
  let component: SetupBuyCallComponent;
  let fixture: ComponentFixture<SetupBuyCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetupBuyCallComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupBuyCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
