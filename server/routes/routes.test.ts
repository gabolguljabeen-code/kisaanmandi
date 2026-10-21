import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.ts';
import { db } from '../db.ts';

test('backend API integration tests', async (t) => {
  const app = createApp();
  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => {
    server.close();
  });

  await t.test('GET /api/health returns status ok and record counts', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body: any = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.counts.crops, 8);
    assert.equal(body.counts.markets, 3);
  });

  await t.test('GET /api/crops returns crops without base_price', async () => {
    const res = await fetch(`${baseUrl}/api/crops`);
    assert.equal(res.status, 200);
    const body: any = await res.json();
    assert.equal(body.length, 8);
    assert.equal(body[0].base_price, undefined);
  });

  await t.test('POST /api/users rejects duplicate phone with 409', async () => {
    // 03000000001 is already seeded for Ali Demo
    const res = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another User',
        phone: '03000000001',
        district: 'Sukkur',
        role: 'Farmer',
      }),
    });
    assert.equal(res.status, 409);
    const body: any = await res.json();
    assert.equal(body.error.code, 'phone_exists');
  });

  await t.test('POST /api/listings rejects past date with 422', async () => {
    const res = await fetch(`${baseUrl}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'u1', // Farmer
      },
      body: JSON.stringify({
        crop_id: 'c1',
        quantity: 10,
        asking_price: 3400,
        district: 'Sukkur',
        grade: 'A',
        available_from: '2020-01-01', // Past date!
        contact_phone: '03000000001',
      }),
    });
    assert.equal(res.status, 422);
    const body: any = await res.json();
    assert.equal(body.error.code, 'validation_error');
    assert.ok(body.error.message_ur.length > 0);
  });

  await t.test('Buyer role is forbidden (403) from creating listing', async () => {
    const res = await fetch(`${baseUrl}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'u2', // Buyer
      },
      body: JSON.stringify({
        crop_id: 'c1',
        quantity: 10,
        asking_price: 3400,
        district: 'Hyderabad',
        grade: 'A',
        available_from: '2028-01-01',
        contact_phone: '03000000002',
      }),
    });
    assert.equal(res.status, 403);
    const body: any = await res.json();
    assert.equal(body.error.code, 'forbidden_role');
  });

  await t.test('Non-owner cannot delete another user listing (403 not_owner)', async () => {
    // l1 is owned by u1
    const res = await fetch(`${baseUrl}/api/listings/l1`, {
      method: 'DELETE',
      headers: {
        'X-User-Id': 'u3', // Different farmer
      },
    });
    assert.equal(res.status, 403);
    const body: any = await res.json();
    assert.equal(body.error.code, 'not_owner');
  });

  await t.test('Alerts triggered count evaluates correctly for farmer u1', async () => {
    // For u1: a1 is Onion above target (triggers)
    const res = await fetch(`${baseUrl}/api/alerts/triggered`, {
      headers: { 'X-User-Id': 'u1' },
    });
    assert.equal(res.status, 200);
    const body: any = await res.json();
    assert.ok(body.count >= 1);
  });

  await t.test('Profit calculation returns correct math and bilingual summary', async () => {
    const res = await fetch(`${baseUrl}/api/profit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop_id: 'c3', // Onion
        market_id: 'm1',
        quantity: 50,
        cost_per_maund: 2000,
        price_shift_percent: 0,
      }),
    });
    assert.equal(res.status, 200);
    const body: any = await res.json();
    assert.ok(body.revenue > 0);
    assert.equal(body.total_cost, 100000);
    assert.ok(body.summary_en.length > 0);
    assert.ok(body.summary_ur.length > 0);
  });
});
