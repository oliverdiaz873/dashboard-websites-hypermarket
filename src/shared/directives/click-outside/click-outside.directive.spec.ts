import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickOutsideDirective } from './click-outside.directive';

@Component({
  template: `
    <div (appClickOutside)="onOutside()" class="host">
      <button type="button" class="inside">Dentro</button>
    </div>
    <button type="button" class="outside">Fuera</button>
  `,
  imports: [ClickOutsideDirective],
})
class HostComponent {
  outsideCalls = 0;
  onOutside(): void {
    this.outsideCalls++;
  }
}

describe('ClickOutsideDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function clickInside(): void {
    (fixture.nativeElement as HTMLElement)
      .querySelector('.inside')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  function clickOutside(): void {
    (fixture.nativeElement as HTMLElement)
      .querySelector('.outside')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  it('no emite cuando el clic ocurre dentro del host', () => {
    clickInside();
    expect(fixture.componentInstance.outsideCalls).toBe(0);
  });

  it('emite cuando el clic ocurre fuera del host', () => {
    clickOutside();
    expect(fixture.componentInstance.outsideCalls).toBe(1);
  });

  it('emite en cada clic fuera', () => {
    clickOutside();
    clickOutside();
    expect(fixture.componentInstance.outsideCalls).toBe(2);
  });
});
