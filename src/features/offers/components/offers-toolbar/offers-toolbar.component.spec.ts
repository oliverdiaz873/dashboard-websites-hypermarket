import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { OffersToolbarComponent } from './offers-toolbar.component';

describe('OffersToolbarComponent', () => {
  let fixture: ComponentFixture<OffersToolbarComponent>;
  let component: OffersToolbarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, OffersToolbarComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    fixture = TestBed.createComponent(OffersToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renderiza el filtro y el botón Nueva oferta', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Estado');
    expect(text).toContain('Nueva oferta');
  });

  it('onActive delega en store.setActiveFilter', () => {
    const spy = jest.spyOn(component['store'], 'setActiveFilter');
    component.onActive('inactive');
    expect(spy).toHaveBeenCalledWith('inactive');
  });

  it('el botón Nueva oferta emite createClicked', () => {
    let emitted = false;
    component.createClicked.subscribe(() => (emitted = true));

    const button = Array.from(fixture.nativeElement.querySelectorAll('button')).find(
      (b: HTMLButtonElement) => b.textContent?.includes('Nueva oferta'),
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
