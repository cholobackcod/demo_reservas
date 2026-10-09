import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspaciosDisponibles } from './espacios-disponibles';

describe('EspaciosDisponibles', () => {
  let component: EspaciosDisponibles;
  let fixture: ComponentFixture<EspaciosDisponibles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspaciosDisponibles],
    }).compileComponents();

    fixture = TestBed.createComponent(EspaciosDisponibles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
