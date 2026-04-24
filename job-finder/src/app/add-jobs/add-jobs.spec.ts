import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJobs } from './add-jobs';

describe('AddJobs', () => {
  let component: AddJobs;
  let fixture: ComponentFixture<AddJobs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddJobs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddJobs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
