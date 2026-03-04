import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevoMetodoPage } from './nuevo-metodo.page';

describe('NuevoMetodoPage', () => {
  let component: NuevoMetodoPage;
  let fixture: ComponentFixture<NuevoMetodoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevoMetodoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
