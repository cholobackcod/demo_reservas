import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarEspacio } from './reservar-espacio';

describe('ReservarEspacio', () => {
  let component: ReservarEspacio;
  let fixture: ComponentFixture<ReservarEspacio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarEspacio],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservarEspacio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
