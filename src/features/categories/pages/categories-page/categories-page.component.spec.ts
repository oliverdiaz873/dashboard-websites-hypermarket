import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { CategoriesPageComponent } from './categories-page.component';
import type { Category } from '../../models/category.model';
import type { TableActionEvent } from '@shared/models/table.model';

const URL = 'http://localhost:3000/api/categories';

const category: Category = {
  id: 'c1',
  name: 'Alimentos',
  slug: 'alimentos',
  subcategories: [{ name: 'Despensa', slug: 'despensa' }],
};

describe('CategoriesPageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CategoriesPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  it('muestra el encabezado de categorías y dispara la carga inicial', async () => {
    const fixture = TestBed.createComponent(CategoriesPageComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Categorías');

    const req = httpMock.expectOne((r) => r.url.includes(URL) && r.method === 'GET');
    req.flush({ success: true, data: [category] });
    await tick();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Alimentos');
  });

  it('onAction con edit abre el formulario', () => {
    const fixture = TestBed.createComponent(CategoriesPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({ success: true, data: [category] });

    const openSpy = jest.spyOn(component as never, 'openFormDialog');
    component.onAction({ actionId: 'edit', row: category } as TableActionEvent<Category>);

    expect(openSpy).toHaveBeenCalledWith(category);
  });

  it('onAction con delete pide confirmación de borrado', () => {
    const fixture = TestBed.createComponent(CategoriesPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({ success: true, data: [category] });

    const deleteSpy = jest.spyOn(component as never, 'requestDelete');
    component.onAction({ actionId: 'delete', row: category } as TableActionEvent<Category>);

    expect(deleteSpy).toHaveBeenCalledWith(category);
  });

  it('openCreate abre el formulario sin categoría', () => {
    const fixture = TestBed.createComponent(CategoriesPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({ success: true, data: [category] });

    const openSpy = jest.spyOn(component as never, 'openFormDialog');
    component.openCreate();

    expect(openSpy).toHaveBeenCalledWith();
  });
});
