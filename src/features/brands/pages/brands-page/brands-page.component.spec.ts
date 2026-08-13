import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { BrandsPageComponent } from './brands-page.component';
import type { Brand } from '../../models/brand.model';
import type { TableActionEvent } from '@shared/models/table.model';

const brand: Brand = {
  id: 'b1',
  name: 'Coca-Cola',
  slug: 'coca-cola',
  status: 'active',
};

describe('BrandsPageComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, BrandsPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('muestra el encabezado de marcas y dispara la carga inicial', () => {
    const fixture = TestBed.createComponent(BrandsPageComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Marcas');
  });

  it('onCreate abre el formulario de creación', () => {
    const fixture = TestBed.createComponent(BrandsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component as never, 'openForm');
    component.onCreate();
    expect(spy).toHaveBeenCalledWith();
  });

  it('onAction con edit abre el formulario con la marca', () => {
    const fixture = TestBed.createComponent(BrandsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component as never, 'openForm');
    component.onAction({ actionId: 'edit', row: brand } as TableActionEvent<Brand>);
    expect(spy).toHaveBeenCalledWith(brand);
  });

  it('onAction con toggle delega en store.toggleStatus', () => {
    const fixture = TestBed.createComponent(BrandsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component['store'], 'toggleStatus');
    component.onAction({ actionId: 'toggle', row: brand } as TableActionEvent<Brand>);
    expect(spy).toHaveBeenCalledWith(brand);
  });

  it('onAction con delete abre el diálogo de confirmación', () => {
    const fixture = TestBed.createComponent(BrandsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component as never, 'confirmDelete');
    component.onAction({ actionId: 'delete', row: brand } as TableActionEvent<Brand>);
    expect(spy).toHaveBeenCalledWith(brand);
  });

  it('retry vuelve a cargar el store', () => {
    const fixture = TestBed.createComponent(BrandsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const spy = jest.spyOn(component['store'], 'load');
    component.retry();
    expect(spy).toHaveBeenCalled();
  });
});
