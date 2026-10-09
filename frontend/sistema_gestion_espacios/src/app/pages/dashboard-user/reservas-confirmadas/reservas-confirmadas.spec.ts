import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasConfirmadas } from './reservas-confirmadas';

describe('ReservasConfirmadas', () => {
  let component: ReservasConfirmadas;
  let fixture: ComponentFixture<ReservasConfirmadas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasConfirmadas],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasConfirmadas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
