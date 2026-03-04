import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VoucherPage } from './voucher.page';

describe('VoucherPage', () => {
  let component: VoucherPage;
  let fixture: ComponentFixture<VoucherPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VoucherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
