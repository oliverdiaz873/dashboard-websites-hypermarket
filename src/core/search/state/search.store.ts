import { DestroyRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  BehaviorSubject,
  Observable,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
} from 'rxjs';

import {
  EMPTY_SEARCH_RESULTS,
  GlobalSearchItem,
  GlobalSearchResults,
} from '../models/global-search-result.model';
import { GlobalSearchService } from '../services/global-search.service';

export type GlobalSearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface SearchState {
  query: string;
  results: GlobalSearchResults;
  status: GlobalSearchStatus;
  error: string | null;
  isOpen: boolean;
  activeIndex: number;
}

/** Evento de resultado para tipar la unión en el pipeline de búsqueda. */
type SearchEvent =
  { kind: 'data'; results: GlobalSearchResults } | { kind: 'error' } | { kind: 'idle' };

const SEARCH_DEBOUNCE_MS = 300;

export const SearchStore = signalStore(
  { providedIn: 'root' },
  withState<SearchState>({
    query: '',
    results: EMPTY_SEARCH_RESULTS,
    status: 'idle',
    error: null,
    isOpen: false,
    activeIndex: -1,
  }),
  withComputed((store) => {
    const flatItems = computed<GlobalSearchItem[]>(() => {
      const r = store.results();
      return [...r.products, ...r.orders, ...r.users, ...r.navigation];
    });

    return {
      flatItems,
      totalCount: computed(() => flatItems().length),
      hasResults: computed(() => flatItems().length > 0),
      isEmpty: computed(() => flatItems().length === 0),
      activeItem: computed<GlobalSearchItem | null>(() => {
        const index = store.activeIndex();
        const items = flatItems();
        return index >= 0 && index < items.length ? items[index] : null;
      }),
    };
  }),
  withMethods((store) => {
    const globalSearchService = inject(GlobalSearchService);
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);

    const query$ = new BehaviorSubject<string>('');

    query$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        switchMap((q): Observable<SearchEvent> => {
          const trimmed = q.trim();
          if (!trimmed) {
            return of<SearchEvent>({ kind: 'idle' });
          }
          return globalSearchService.search(trimmed).pipe(
            map((results): SearchEvent => ({ kind: 'data', results })),
            catchError((): Observable<SearchEvent> => of<SearchEvent>({ kind: 'error' })),
          );
        }),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe({
        next: (event) => {
          switch (event.kind) {
            case 'data':
              patchState(store, { results: event.results, status: 'success', error: null });
              break;
            case 'error':
              patchState(store, {
                status: 'error',
                error: 'No se pudo completar la búsqueda.',
              });
              break;
            case 'idle':
              patchState(store, { results: EMPTY_SEARCH_RESULTS, status: 'idle', error: null });
              break;
          }
        },
      });

    return {
      setQuery(query: string): void {
        const trimmed = query.trim();
        patchState(store, { query, isOpen: true, activeIndex: -1 });
        if (trimmed) {
          patchState(store, { status: 'loading', error: null });
        } else {
          patchState(store, { status: 'idle', results: EMPTY_SEARCH_RESULTS });
        }
        query$.next(query);
      },

      open(): void {
        patchState(store, { isOpen: true });
      },

      close(): void {
        patchState(store, { isOpen: false });
      },

      toggle(): void {
        patchState(store, { isOpen: !store.isOpen() });
      },

      clear(): void {
        patchState(store, {
          query: '',
          results: EMPTY_SEARCH_RESULTS,
          status: 'idle',
          error: null,
          isOpen: false,
          activeIndex: -1,
        });
        query$.next('');
      },

      moveSelection(delta: number): void {
        const items = store.flatItems();
        if (items.length === 0) return;
        const current = store.activeIndex();
        const nextIndex = Math.max(0, Math.min(items.length - 1, current + delta));
        patchState(store, { activeIndex: nextIndex, isOpen: true });
      },

      moveTo(item: GlobalSearchItem): void {
        const index = store.flatItems().findIndex((candidate) => candidate.id === item.id);
        if (index >= 0) patchState(store, { activeIndex: index });
      },

      selectActive(): void {
        const items = store.flatItems();
        const target = items[store.activeIndex()];
        if (target) {
          patchState(store, { activeIndex: -1, isOpen: false });
          void router.navigateByUrl(target.route);
        }
      },

      select(item: GlobalSearchItem): void {
        patchState(store, { activeIndex: -1, isOpen: false });
        void router.navigateByUrl(item.route);
      },
    };
  }),
);
