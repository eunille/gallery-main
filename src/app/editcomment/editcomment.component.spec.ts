import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditcommentComponent } from './editcomment.component';

describe('EditcommentComponent', () => {
  let component: EditcommentComponent;
  let fixture: ComponentFixture<EditcommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditcommentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditcommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
