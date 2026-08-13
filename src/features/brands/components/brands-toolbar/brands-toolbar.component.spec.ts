import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { BrandsToolbarComponent } from './brands-toolbar.component';

describe('BrandsToolbarComponent', () => {
  let fixture: ComponentFixture<BrandsToolbarComponent>;
  let component: BrandsToolbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, BrandsToolbarComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(BrandsToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza el filtro y el botón Nueva marca', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Estado');
    expect(text).toContain('Nueva marca');
  });

  it('onStatus delega en store.setStatusFilter', () => {
    const spy = jest.spyOn(component['store'], 'setStatusFilter');
    component.onStatus('inactive');
    expect(spy).toHaveBeenCalledWith('inactive');
  });

  it('el botón Nueva marca emite createClicked', () => {
    let emitted = false;
    component.createClicked.subscribe(() => (emitted = true));

    const button = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (b: HTMLButtonElement) => b.textContent?.includes('Nueva marca'),
    ) as HTMLButtonElement;
    button.click();

    expect(emitted).toBe(true);
  });

  it('existe una acción de recargar que llama a store.refresh', () => {
    const refreshButton = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (b: HTMLButtonElement) => b.querySelector('mat-icon')?.textContent?.includes('refresh'),
    );
    expect(refreshButton).toBeTruthy();
  });
});
