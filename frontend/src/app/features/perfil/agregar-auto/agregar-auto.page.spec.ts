import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarAutoPage } from './agregar-auto.page';

describe('AgregarAutoPage', () => {
  let component: AgregarAutoPage;
  let fixture: ComponentFixture<AgregarAutoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarAutoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
