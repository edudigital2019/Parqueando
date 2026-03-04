import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleParqueaderoPage } from './detalle-parqueadero.page';

describe('DetalleParqueaderoPage', () => {
  let component: DetalleParqueaderoPage;
  let fixture: ComponentFixture<DetalleParqueaderoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleParqueaderoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
