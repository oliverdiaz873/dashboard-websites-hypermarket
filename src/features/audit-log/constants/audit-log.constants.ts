export const AUDIT_ACTIONS = [
  'LOGIN',
  'REGISTER',
  'INVENTORY_ADJUST',
  'INVENTORY_RESERVE',
  'INVENTORY_RELEASE',
  'INVENTORY_COMPLETE_SALE',
  'CREATE_ORDER',
  'UPDATE_ORDER_STATUS',
  'CANCEL_ORDER',
  'CREATE_PRODUCT',
  'UPDATE_PRODUCT',
  'DELETE_PRODUCT',
  'CREATE_CATEGORY',
  'UPDATE_CATEGORY',
  'DELETE_CATEGORY',
  'CREATE_BRAND',
  'UPDATE_BRAND',
  'DELETE_BRAND',
  'CREATE_OFFER',
  'UPDATE_OFFER',
  'DELETE_OFFER',
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  LOGIN: 'Inicio de sesión',
  REGISTER: 'Registro',
  INVENTORY_ADJUST: 'Ajuste de inventario',
  INVENTORY_RESERVE: 'Reserva de stock',
  INVENTORY_RELEASE: 'Liberación de stock',
  INVENTORY_COMPLETE_SALE: 'Venta completada',
  CREATE_ORDER: 'Pedido creado',
  UPDATE_ORDER_STATUS: 'Estado de pedido',
  CANCEL_ORDER: 'Pedido cancelado',
  CREATE_PRODUCT: 'Producto creado',
  UPDATE_PRODUCT: 'Producto actualizado',
  DELETE_PRODUCT: 'Producto eliminado',
  CREATE_CATEGORY: 'Categoría creada',
  UPDATE_CATEGORY: 'Categoría actualizada',
  DELETE_CATEGORY: 'Categoría eliminada',
  CREATE_BRAND: 'Marca creada',
  UPDATE_BRAND: 'Marca actualizada',
  DELETE_BRAND: 'Marca eliminada',
  CREATE_OFFER: 'Oferta creada',
  UPDATE_OFFER: 'Oferta actualizada',
  DELETE_OFFER: 'Oferta eliminada',
  CREATE_USER: 'Usuario creado',
  UPDATE_USER: 'Usuario actualizado',
  DELETE_USER: 'Usuario eliminado',
};

export const AUDIT_ENTITIES = [
  'auth',
  'user',
  'product',
  'inventory',
  'order',
  'category',
  'brand',
  'offer',
] as const;

export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  auth: 'Autenticación',
  user: 'Usuarios',
  product: 'Productos',
  inventory: 'Inventario',
  order: 'Pedidos',
  category: 'Categorías',
  brand: 'Marcas',
  offer: 'Ofertas',
};

export const getAuditActionLabel = (action: AuditAction): string =>
  AUDIT_ACTION_LABELS[action] ?? action;

export const getAuditEntityLabel = (entity: string): string =>
  AUDIT_ENTITY_LABELS[entity] ?? entity;

export const AUDIT_ACTION_OPTIONS = AUDIT_ACTIONS.map((value) => ({
  value,
  label: AUDIT_ACTION_LABELS[value],
}));

export const AUDIT_ENTITY_OPTIONS = AUDIT_ENTITIES.map((value) => ({
  value,
  label: AUDIT_ENTITY_LABELS[value],
}));

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [20, 50, 100];
