import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { SORT_DIRECTION, type SortDirection } from '@core/enums/sort-direction';
import { getStorageItem, setStorageItem } from '@core/utils/storage.util';

import { ProductsService } from '../services/products.service';
import { CategoriesService } from '../services/categories.service';
import { BrandsService } from '../services/brands.service';
import type {
  CreateProductPayload,
  Product,
  ProductStatus,
  UpdateProductPayload,
} from '../models/product.model';
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  PRODUCT_SORT_FIELDS,
  type ProductSortField,
} from '../constants/products.constants';

interface ProductsState {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  category: string;
  status: ProductStatus | '';
  sortBy: ProductSortField;
  sortOrder: SortDirection;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  selectedIds: string[];
  categories: { value: string; label: string }[];
  categoryOptions: { value: string; label: string }[];
  brandOptions: { value: string; label: string }[];
  isSubmitting: boolean;
}

function initialSortBy(): ProductSortField {
  const stored = getStorageItem<ProductSortField>(STORAGE_KEYS.productsSortBy);
  return stored !== null && (PRODUCT_SORT_FIELDS as readonly string[]).includes(stored)
    ? stored
    : 'name';
}

function initialSortOrder(): SortDirection {
  const stored = getStorageItem<SortDirection>(STORAGE_KEYS.productsSortOrder);
  return stored === SORT_DIRECTION.DESC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;
}

function initialPageSize(): number {
  const stored = getStorageItem<number>(STORAGE_KEYS.productsPageSize);
  return stored !== null && PAGE_SIZE_OPTIONS.includes(stored) ? stored : DEFAULT_PAGE_SIZE;
}

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState<ProductsState>(() => ({
    products: [],
    total: 0,
    page: 1,
    pageSize: initialPageSize(),
    search: '',
    category: '',
    status: '',
    sortBy: initialSortBy(),
    sortOrder: initialSortOrder(),
    isLoading: false,
    hasLoaded: false,
    error: null,
    selectedIds: [],
    categories: [],
    categoryOptions: [],
    brandOptions: [],
    isSubmitting: false,
  })),
  withComputed(({ products, selectedIds }) => ({
    isEmpty: computed(() => products().length === 0),
    selectedCount: computed(() => selectedIds().length),
  })),
  withMethods((store) => {
    const productsService = inject(ProductsService);
    const categoriesService = inject(CategoriesService);
    const brandsService = inject(BrandsService);

    const load = async (): Promise<void> => {
      if (store.isLoading()) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const result = await firstValueFrom(
          productsService.list({
            page: store.page(),
            limit: store.pageSize(),
            q: store.search() || undefined,
            category: store.category() || undefined,
            status: store.status() || undefined,
            sortBy: store.sortBy(),
            sortOrder: store.sortOrder(),
          }),
        );
        patchState(store, {
          products: result.data,
          total: result.pagination.total,
          hasLoaded: true,
        });
      } catch {
        patchState(store, { error: 'No se pudieron cargar los productos.' });
      } finally {
        patchState(store, { isLoading: false });
      }
    };

    const applySort = (field: ProductSortField, direction: SortDirection): void => {
      setStorageItem(STORAGE_KEYS.productsSortBy, field);
      setStorageItem(STORAGE_KEYS.productsSortOrder, direction);
      patchState(store, { sortBy: field, sortOrder: direction, page: 1 });
      void load();
    };

    return {
      load,

      async loadCategories(): Promise<void> {
        if (store.categories().length > 0) return;
        try {
          const categories = await firstValueFrom(categoriesService.list());
          const options = categories.flatMap((c) => {
            if (c.subcategories && c.subcategories.length > 0) {
              return c.subcategories.map((sub) => ({
                value: sub.slug,
                label: `${c.name} - ${sub.name}`,
              }));
            }
            return [{ value: c.slug, label: c.name }];
          });
          patchState(store, { categories: options });
        } catch {
          /* Sin categorías no bloquea el listado de productos. */
        }
      },

      async loadFormOptions(): Promise<void> {
        if (store.categoryOptions().length > 0 && store.brandOptions().length > 0) return;
        void this.loadCategoryOptions();
        void this.loadBrandOptions();
      },

      async loadCategoryOptions(): Promise<void> {
        if (store.categoryOptions().length > 0) return;
        try {
          const categories = await firstValueFrom(categoriesService.list());
          patchState(store, {
            categoryOptions: categories.map((c) => ({ value: c.id, label: c.name })),
          });
        } catch {
          /* Sin categorías el formulario no puede crear; el submit lo valida. */
        }
      },

      async loadBrandOptions(): Promise<void> {
        if (store.brandOptions().length > 0) return;
        try {
          const brands = await firstValueFrom(brandsService.list());
          patchState(store, {
            brandOptions: brands.map((b) => ({ value: b.id, label: b.name })),
          });
        } catch {
          /* Las marcas son opcionales en el formulario. */
        }
      },

      setPage(page: number): void {
        patchState(store, { page });
        void load();
      },

      setPageSize(pageSize: number): void {
        setStorageItem(STORAGE_KEYS.productsPageSize, pageSize);
        patchState(store, { pageSize, page: 1 });
        void load();
      },

      setSearch(search: string): void {
        patchState(store, { search, page: 1 });
        void load();
      },

      setCategory(category: string): void {
        patchState(store, { category, page: 1 });
        void load();
      },

      setStatus(status: ProductStatus | ''): void {
        patchState(store, { status, page: 1 });
        void load();
      },

      setSort(field: ProductSortField, direction: SortDirection): void {
        applySort(field, direction);
      },

      onSortChange(sort: { key: string; direction: SortDirection }): void {
        if (!(PRODUCT_SORT_FIELDS as readonly string[]).includes(sort.key)) return;
        applySort(sort.key as ProductSortField, sort.direction);
      },

      refresh(): void {
        void load();
      },

      async createProduct(payload: CreateProductPayload): Promise<Product> {
        patchState(store, { isSubmitting: true, error: null });
        try {
          const product = await firstValueFrom(productsService.create(payload));
          patchState(store, { isSubmitting: false });
          await load();
          return product;
        } catch (error) {
          patchState(store, { isSubmitting: false, error: toErrorMessage(error) });
          throw error;
        }
      },

      async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
        patchState(store, { isSubmitting: true, error: null });
        try {
          const product = await firstValueFrom(productsService.update(id, payload));
          patchState(store, { isSubmitting: false });
          await load();
          return product;
        } catch (error) {
          patchState(store, { isSubmitting: false, error: toErrorMessage(error) });
          throw error;
        }
      },

      async deleteProduct(id: string): Promise<void> {
        patchState(store, { isSubmitting: true, error: null });
        try {
          await firstValueFrom(productsService.remove(id));
          patchState(store, { isSubmitting: false });
          await load();
        } catch (error) {
          patchState(store, { isSubmitting: false, error: toErrorMessage(error) });
          throw error;
        }
      },

      async loadProduct(id: string): Promise<Product | null> {
        try {
          return await firstValueFrom(productsService.getById(id));
        } catch {
          return null;
        }
      },

      setSelectedIds(ids: string[]): void {
        patchState(store, { selectedIds: ids });
      },

      clearSelection(): void {
        patchState(store, { selectedIds: [] });
      },
    };
  }),
);

function toErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return null;
}
