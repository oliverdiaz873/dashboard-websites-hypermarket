import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SearchInputComponent } from './search-input.component';

describe('SearchInputComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, NoopAnimationsModule],
    }).compileComponents();
    const fixture = TestBed.createComponent(SearchInputComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, comp };
  }

  it('emite el término tras el debounce predeterminado', async () => {
    const { fixture, comp } = await setup();
    let emitted: string | undefined;
    comp.searchChange.subscribe((v) => (emitted = v));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'arroz';
    input.dispatchEvent(new Event('input'));

    expect(emitted).toBeUndefined();
    await new Promise((r) => setTimeout(r, 350));
    expect(emitted).toBe('arroz');
  });

  it('el botón limpiar emite vacío', async () => {
    const { fixture, comp } = await setup();
    let emitted: string | undefined = 'x';
    comp.searchChange.subscribe((v) => (emitted = v));

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'hola';
    input.dispatchEvent(new Event('input'));

    await new Promise((r) => setTimeout(r, 350));
    const clearBtn = fixture.nativeElement.querySelector('button');
    clearBtn.dispatchEvent(new Event('click'));

    expect(emitted).toBe('');
  });
});
