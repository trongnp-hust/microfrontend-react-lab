const { test, expect } = require('@playwright/test');
test('federated cart, routing, persistence and auth props', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Thêm vào giỏ' }).first().click();
  await page.getByRole('button', { name: 'Thêm vào giỏ' }).first().click();
  await expect(page.getByText('Số lượng: 2')).toBeVisible();
  await page.getByRole('button', { name: 'Đăng nhập demo', exact: true }).click();
  await expect(page.getByText(/Xin chào Học viên React/)).toBeVisible();
  await page.getByRole('navigation').getByRole('link', { name: 'Giỏ hàng' }).click();
  await page.reload();
  await expect(page.getByText('Số lượng: 2')).toBeVisible();
  await page.getByRole('button', { name: 'Xóa Bàn phím cơ' }).click();
  await expect(page.getByText(/Giỏ hàng trống/)).toBeVisible();
});
test('Catalog outage is isolated and retry recovers', async ({ page }) => {
  await page.route('**/3001/**', route => route.abort());
  // Match URL with port explicitly.
  await page.route(/localhost:3001\//, route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('catalog đang gián đoạn');
  await expect(page.getByRole('heading', { name: 'Giỏ hàng', exact: true })).toBeVisible();
  await page.unrouteAll();
  await page.getByRole('button', { name: 'Thử lại' }).click();
  await expect(page.getByRole('button', { name: 'Thêm vào giỏ' }).first()).toBeVisible();
});
test('remotes can start independently', async ({ page }) => {
  await page.goto('http://localhost:3001');
  await expect(page.getByRole('heading', { name: 'Góc làm việc của bạn' })).toBeVisible();
  await page.goto('http://localhost:3002');
  await expect(page.getByRole('heading', { name: 'Giỏ hàng', exact: true })).toBeVisible();
});

test('Catalog reads BFF DTO and disables out-of-stock products', async ({ page }) => {
  const responsePromise = page.waitForResponse('http://localhost:4000/api/catalog');
  await page.goto('/');
  const response = await responsePromise;
  const data = await response.json();
  expect(data.meta.bff).toBe('catalog-bff');
  expect(data.items[0].stock).toBe(12);
  await expect(page.getByText('Còn 12 sản phẩm')).toBeVisible();
  const mouse = page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Chuột không dây' }) });
  await expect(mouse.getByRole('button', { name: 'Thêm vào giỏ' })).toBeDisabled();
});
test('BFF failure stays inside Catalog and API retry recovers', async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ status: 502, contentType: 'application/json', body: '{}' }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('BFF không khả dụng');
  await expect(page.getByRole('heading', { name: 'Giỏ hàng', exact: true })).toBeVisible();
  await page.unroute('**/api/catalog');
  await page.getByRole('button', { name: 'Thử lại API' }).click();
  await expect(page.getByText('Còn 12 sản phẩm')).toBeVisible();
});
