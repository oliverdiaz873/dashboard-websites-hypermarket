import { firstValueFrom } from 'rxjs';

import { MockCustomerDataSource } from './mock-customer-data-source';

describe('MockCustomerDataSource', () => {
  let source: MockCustomerDataSource;

  beforeEach(() => {
    source = new MockCustomerDataSource();
    source.delayMs = 0;
  });

  it('lista la primera página con todos los clientes sembrados', async () => {
    const res = await firstValueFrom(source.list({ page: 1, limit: 20 }));

    expect(res.data.length).toBe(12);
    expect(res.pagination.total).toBe(12);
    expect(res.pagination.pages).toBe(1);
  });

  it('filtra por texto en nombre, correo o teléfono', async () => {
    const res = await firstValueFrom(source.list({ page: 1, limit: 20, q: 'rodriguez' }));

    expect(res.data).toHaveLength(1);
    expect(res.data[0]?.name).toBe('Ana María Rodríguez');
  });

  it('filtra por estado', async () => {
    const res = await firstValueFrom(source.list({ page: 1, limit: 20, status: 'blocked' }));

    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((c) => c.status === 'blocked')).toBe(true);
  });

  it('ordena por nombre en ambas direcciones', async () => {
    const asc = await firstValueFrom(
      source.list({ page: 1, limit: 20, sortBy: 'name', sortOrder: 'asc' }),
    );
    const desc = await firstValueFrom(
      source.list({ page: 1, limit: 20, sortBy: 'name', sortOrder: 'desc' }),
    );

    expect(asc.data[0]?.name.localeCompare(asc.data[1]!.name)).toBeLessThanOrEqual(0);
    expect(desc.data[0]?.name.localeCompare(desc.data[1]!.name)).toBeGreaterThanOrEqual(0);
  });

  it('pagina el listado sin solapar filas', async () => {
    const page1 = await firstValueFrom(source.list({ page: 1, limit: 5 }));
    const page2 = await firstValueFrom(source.list({ page: 2, limit: 5 }));

    expect(page1.data).toHaveLength(5);
    expect(page2.data).toHaveLength(5);
    expect(page1.data[0]?.id).not.toBe(page2.data[0]?.id);
  });

  it('crea un cliente activo y lo antepone al listado', async () => {
    const created = await firstValueFrom(
      source.create({ name: 'Nuevo Cliente', email: 'nuevo@correo.com' }),
    );
    const res = await firstValueFrom(source.list({ page: 1, limit: 20, q: 'nuevo' }));

    expect(created.id).toMatch(/^CUS-/);
    expect(created.status).toBe('active');
    expect(res.data[0]?.id).toBe(created.id);
  });

  it('actualiza solo los campos enviados (PATCH)', async () => {
    const updated = await firstValueFrom(source.update('CUS-0001', { phone: '(809) 555-9999' }));

    expect(updated.phone).toBe('(809) 555-9999');
    expect(updated.name).toBe('Ana María Rodríguez');
  });

  it('cambia el estado con updateStatus', async () => {
    const updated = await firstValueFrom(source.updateStatus('CUS-0001', 'blocked'));

    expect(updated.status).toBe('blocked');
  });

  it('lanza error si el cliente no existe', async () => {
    await expect(firstValueFrom(source.findById('CUS-9999'))).rejects.toThrow();
    await expect(firstValueFrom(source.update('CUS-9999', { name: 'X' }))).rejects.toThrow();
  });

  it('calcula stats coherentes con los clientes', async () => {
    const stats = await firstValueFrom(source.stats());
    const all = await firstValueFrom(source.list({ page: 1, limit: 100 }));

    expect(stats.total).toBe(all.pagination.total);
    expect(stats.active + stats.blocked + stats.pending).toBe(stats.total);
    expect(stats.newThisMonth).toBeGreaterThanOrEqual(0);
  });
});
