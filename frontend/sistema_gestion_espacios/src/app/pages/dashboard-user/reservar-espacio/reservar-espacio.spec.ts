import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ReservarEspacio } from './reservar-espacio';

describe('ReservarEspacio', () => {
  let component: ReservarEspacio;
  let fixture: ComponentFixture<ReservarEspacio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarEspacio],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReservarEspacio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
