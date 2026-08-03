# Product CRUD Decisions (Phase 5)

> Referencia de decisiones tomadas durante la Fase 5. Léela antes de tocar el
> módulo de productos o el de inventario.

## Images

- **URL based.** El producto guarda una `image` como URL string. El formulario
  solo pide/reutiliza una URL. No hay infraestructura de upload.
- **Upload: pending.** Cuando se quiera subir archivos reales el flujo será
  `Dashboard → storage → URL → MongoDB`. Fuera del alcance actual.

## Stock

- **Create:** `stock` y `minStock` son campos del formulario y el backend crea
  el registro de inventario al crear el producto (`POST /products`).
- **Edit:** el formulario **no** envía `stock` ni `minStock`. El inventario se
  gestionará por el **módulo de inventario** (futuro). No tocar stock desde
  `PATCH /products/:id`.

## Delete

- **Hard delete.** `DELETE /products/:id` elimina físicamente el producto y su
  inventario relacionado.
- **Dependency cleanup fuera de scope.** Referencias a pedidos/carrito huérfanas
  por el borrado no se gestionan aún.

## Payloads (Create ≠ Update)

- `CreateProductPayload` incluye `sku?, brandId?, stock?, minStock?`.
- `UpdateProductPayload` es parcial, **no** incluye `stock`/`minStock`, y
  `brandId: null` limpia la marca.

## Where this lives

- Formulario: `features/products/components/product-form`
- Store/opciones de marca y categoría: `features/products/state/products.store`
- Docs de decisiones: `docs/product-crud-decisions.md`
