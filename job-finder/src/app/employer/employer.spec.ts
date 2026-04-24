import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Employer } from './employer';

describe('Employer', () => {
  let component: Employer;
  let fixture: ComponentFixture<Employer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Employer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Employer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
