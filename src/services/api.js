// Simulación de un cliente Axios + middleware de mocks
import products from "../mocks/products.json";
import orders from "../mocks/orders.json";
import customers from "../mocks/customers.json";
import categories from "../mocks/categories.json";
import attributes from "../mocks/attributes.json";
import options from "../mocks/options.json";
import collections from "../mocks/collections.json";
import suppliers from "../mocks/suppliers.json";
import reserves from "../mocks/reserves.json";
import inputs from "../mocks/inputs.json";
import purchaseOrders from "../mocks/purchaseOrders.json";
import campaigns from "../mocks/campaigns.json";

const db = {
  products,
  orders,
  customers,
  categories,
  attributes,
  options,
  collections,
  suppliers,
  reserves,
  inputs,
  purchaseOrders,
  campaigns
};

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

function applyQuery(list, { q, sort, order = "asc", page = 1, pageSize = 20 } = {}) {
  let data = [...list];
  if (q) {
    const term = String(q).toLowerCase();
    data = data.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  }
  if (sort) {
    data.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * (order === "desc" ? -1 : 1);
    });
  }
  const total = data.length;
  const start = (page - 1) * pageSize;
  const items = data.slice(start, start + pageSize);
  return { items, total, page, pageSize };
}

export const mockApi = {
  async list(resource, params = {}) {
    await delay();
    const list = db[resource] || [];
    return applyQuery(list, params);
  },
  async get(resource, id) {
    await delay();
    const list = db[resource] || [];
    const item = list.find((x) => String(x.id) === String(id));
    if (!item) throw Object.assign(new Error("Not found"), { status: 404 });
    return item;
  },
  async create(resource, payload) {
    await delay();
    const list = db[resource] || (db[resource] = []);
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const item = { id, ...payload, created_at: new Date().toISOString() };
    list.unshift(item);
    return item;
  },
  async update(resource, id, payload) {
    await delay();
    const list = db[resource] || [];
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) throw Object.assign(new Error("Not found"), { status: 404 });
    list[idx] = { ...list[idx], ...payload, updated_at: new Date().toISOString() };
    return list[idx];
  },
  async remove(resource, id) {
    await delay();
    const list = db[resource] || [];
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) throw Object.assign(new Error("Not found"), { status: 404 });
    const [deleted] = list.splice(idx, 1);
    return deleted;
  }
};
