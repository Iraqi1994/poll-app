import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Atf } from './atf';

describe('Atf', () => {
  let component: Atf;
  let fixture: ComponentFixture<Atf>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Atf],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Atf);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
