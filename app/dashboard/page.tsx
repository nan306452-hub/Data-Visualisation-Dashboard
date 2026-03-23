"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DailyMetric = {
  id: number;
  day: number;
  inventory: number;
  procurementQty: number;
  procurementPrice: number;
  salesQty: number;
  salesPrice: number;
  productId: number;
};

type Product = {
  id: number;
  productCode?: string;
  name: string;
  createdAt: string;
  metrics: DailyMetric[];
};

type ComparisonRow = {
  day: string;
  [key: string]: string | number;
};

type ComparisonMetric =
  | "inventory"
  | "procurementAmount"
  | "salesAmount"
  | "procurementPrice"
  | "salesPrice";

const comparisonColors = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#7c3aed",
  "#dc2626",
  "#0891b2",
  "#ca8a04",
  "#9333ea",
];

const comparisonOptions: { label: string; value: ComparisonMetric }[] = [
  { label: "Inventory", value: "inventory" },
  { label: "Procurement Amount", value: "procurementAmount" },
  { label: "Sales Amount", value: "salesAmount" },
  { label: "Procurement Price", value: "procurementPrice" },
  { label: "Sales Price", value: "salesPrice" },
];

export default function DashboardPage() {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [comparisonMetric, setComparisonMetric] =
    useState<ComparisonMetric>("inventory");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const comparisonData = useMemo(() => {
    const selected = products.filter((p) => selectedProducts.includes(p.id));

    if (selected.length === 0) return [];

    const allDays = Array.from(
      new Set(
        selected.flatMap((product) => product.metrics.map((metric) => metric.day))
      )
    ).sort((a, b) => a - b);

    return allDays.map((day) => {
      const row: ComparisonRow = {
        day: `Day ${day}`,
      };

      selected.forEach((product) => {
        const metric = product.metrics.find((m) => m.day === day);

        if (!metric) {
          row[product.name] = 0;
          return;
        }

        if (comparisonMetric === "inventory") {
          row[product.name] = metric.inventory;
        } else if (comparisonMetric === "procurementAmount") {
          row[product.name] = metric.procurementQty * metric.procurementPrice;
        } else if (comparisonMetric === "salesAmount") {
          row[product.name] = metric.salesQty * metric.salesPrice;
        } else if (comparisonMetric === "procurementPrice") {
          row[product.name] = metric.procurementPrice;
        } else if (comparisonMetric === "salesPrice") {
          row[product.name] = metric.salesPrice;
        }
      });

      return row;
    });
  }, [products, selectedProducts, comparisonMetric]);

  const totalInventory = products.reduce((sum, product) => {
    const latestMetric = [...product.metrics].sort((a, b) => a.day - b.day).at(-1);
    return sum + (latestMetric?.inventory || 0);
  }, 0);

  const totalProcurementAmount = products.reduce((sum, product) => {
    return (
      sum +
      product.metrics.reduce(
        (innerSum, metric) =>
          innerSum + metric.procurementQty * metric.procurementPrice,
        0
      )
    );
  }, 0);

  const totalSalesAmount = products.reduce((sum, product) => {
    return (
      sum +
      product.metrics.reduce(
        (innerSum, metric) => innerSum + metric.salesQty * metric.salesPrice,
        0
      )
    );
  }, 0);

  const filteredProducts = products.filter((product) => {
    const query = productSearch.toLowerCase().trim();
    return (
      product.name.toLowerCase().includes(query) ||
      (product.productCode || "").toLowerCase().includes(query)
    );
  });

  const displayedProducts =
    showSelectedOnly && selectedProducts.length > 0
      ? products.filter((product) => selectedProducts.includes(product.id))
      : products;

  if (loading) {
    return (
      <main className="min-h-screen bg-green-50 p-8 text-slate-900">
        <div className="mx-auto max-w-7xl">Loading dashboard...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green-50 p-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Monitor inventory levels, procurement activity, and sales performance
              </p>

              <p className="mt-3 text-sm text-slate-400">
                Total products: {products.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  const confirmed = window.confirm(
                    "Are you sure you want to delete all product data?"
                  );
                  if (!confirmed) return;

                  const res = await fetch("/api/reset", { method: "POST" });

                  if (res.ok) {
                    alert("Data reset successful");
                    window.location.reload();
                  } else {
                    alert("Failed to reset data");
                  }
                }}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
              >
                Reset Data
              </button>

              <button
                onClick={async () => {
                  await fetch("/api/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Inventory</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {totalInventory}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Latest inventory across all products
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Procurement</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              ${totalProcurementAmount.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Total procurement value
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Sales</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              ${totalSalesAmount.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Total sales value
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-green-200 bg-white p-4">
          <p className="mb-3 text-sm font-medium">Upload Inventory File</p>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-green-300 bg-green-50 px-6 py-8 text-center transition hover:bg-green-100">
            <span className="text-lg font-medium text-green-700">
              Click to upload file
            </span>

            <span className="mt-1 text-sm text-slate-500">
              or drag and drop (CSV or XLSX)
            </span>

            <input
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload", {
                  method: "POST",
                  body: formData,
                });

                const data = await res.json();

                if (res.ok) {
                  alert(
                    `Upload successful.\nProducts processed: ${data.processedProducts}\nCreated day records: ${data.createdMetricRows}\nUpdated day records: ${data.updatedMetricRows}`
                  );
                  window.location.reload();
                } else {
                  alert(data.error || "Upload failed");
                }
              }}
            />
          </label>
        </div>

        {products.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-1 text-sm font-semibold text-slate-900">
              Compare products
            </p>
            <p className="mb-4 text-sm text-slate-500">
              Select products to compare in the chart below.
            </p>

            <div className="mb-4">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by product name or code..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {filteredProducts.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => {
                      setSelectedProducts((prev) =>
                        prev.includes(product.id)
                          ? prev.filter((id) => id !== product.id)
                          : [...prev, product.id]
                      );
                    }}
                  />
                  {product.name}
                </label>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                No matching products found.
              </p>
            )}

            <div className="mt-3 text-xs text-slate-400">
              {selectedProducts.length} selected
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4">
              <p className="mb-3 text-sm font-semibold text-slate-900">
                Displayed product details
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSelectedOnly(false)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    !showSelectedOnly
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Show All Details
                </button>

                <button
                  onClick={() => setShowSelectedOnly(true)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    showSelectedOnly
                      ? "bg-green-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Show Selected Details Only
                </button>
              </div>

              {showSelectedOnly && selectedProducts.length === 0 && (
                <p className="mt-3 text-sm text-slate-500">
                  No products selected. Please select products above.
                </p>
              )}
            </div>
          </div>
        )}

        {selectedProducts.length > 0 && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Product Comparison</h3>
              <p className="text-sm text-slate-500">
                Compare selected products by{" "}
                {comparisonOptions
                  .find((option) => option.value === comparisonMetric)
                  ?.label.toLowerCase()}{" "}
                over time
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {comparisonOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setComparisonMetric(option.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    comparisonMetric === option.value
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                    }}
                  />
                  <Legend />
                  {products
                    .filter((product) => selectedProducts.includes(product.id))
                    .map((product, index) => (
                      <Line
                        key={product.id}
                        type="monotone"
                        dataKey={product.name}
                        name={product.name}
                        stroke={comparisonColors[index % comparisonColors.length]}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {products.length === 0 && (
          <div className="mb-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold">No product data yet</h2>
            <p className="mt-2 text-slate-500">
              Upload a CSV or XLSX file to populate the dashboard.
            </p>
          </div>
        )}

        {showSelectedOnly && selectedProducts.length === 0 && (
          <div className="mb-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold">No selected products</h2>
            <p className="mt-2 text-slate-500">
              Select one or more products above to view only their details.
            </p>
          </div>
        )}

        {displayedProducts.map((product) => {
          const sortedMetrics = [...product.metrics].sort((a, b) => a.day - b.day);

          const chartData = sortedMetrics.map((metric) => ({
            day: `Day ${metric.day}`,
            inventory: metric.inventory,
            procurementAmount: metric.procurementQty * metric.procurementPrice,
            salesAmount: metric.salesQty * metric.salesPrice,
          }));

          const latestMetric = sortedMetrics[sortedMetrics.length - 1];
          const latestProcurementAmount =
            latestMetric.procurementQty * latestMetric.procurementPrice;
          const latestSalesAmount =
            latestMetric.salesQty * latestMetric.salesPrice;

          return (
            <section
              key={product.id}
              className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Product Code: {product.productCode || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-green-50 p-4">
                  <p className="text-sm text-slate-500">Latest Inventory</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {latestMetric.inventory}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Based on {`Day ${latestMetric.day}`}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-green-50 p-4">
                  <p className="text-sm text-slate-500">Latest Procurement Amount</p>
                  <p className="mt-2 text-3xl font-semibold">
                    ${latestProcurementAmount.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Based on {`Day ${latestMetric.day}`}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-green-50 p-4">
                  <p className="text-sm text-slate-500">Latest Sales Amount</p>
                  <p className="mt-2 text-3xl font-semibold">
                    ${latestSalesAmount.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Based on {`Day ${latestMetric.day}`}
                  </p>
                </div>
              </div>

              <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Performance Over Time</h3>
                  <p className="text-sm text-slate-500">
                    Inventory, procurement amount, and sales amount across days
                  </p>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e2e8f0",
                          backgroundColor: "#ffffff",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="inventory"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="procurementAmount"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="salesAmount"
                        stroke="#ea580c"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Daily Details</h3>
                  <p className="text-sm text-slate-500">
                    Processed metrics and raw inputs for each day
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  {sortedMetrics.map((metric) => {
                    const procurementAmount =
                      metric.procurementQty * metric.procurementPrice;
                    const salesAmount = metric.salesQty * metric.salesPrice;

                    return (
                      <div
                        key={metric.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="mb-4">
                          <p className="text-xl font-semibold">{`Day ${metric.day}`}</p>
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-sm text-slate-500">Inventory</p>
                            <p className="mt-1 text-2xl font-semibold">
                              {metric.inventory}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-sm text-slate-500">
                              Procurement Amount
                            </p>
                            <p className="mt-1 text-2xl font-semibold">
                              ${procurementAmount.toFixed(2)}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-white p-4">
                            <p className="text-sm text-slate-500">Sales Amount</p>
                            <p className="mt-1 text-2xl font-semibold">
                              ${salesAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                          <p className="mb-3 text-sm font-medium text-slate-600">
                            Raw Data
                          </p>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-slate-500">Procurement Qty</p>
                              <p className="font-medium">{metric.procurementQty}</p>
                            </div>

                            <div>
                              <p className="text-slate-500">Procurement Price</p>
                              <p className="font-medium">
                                ${metric.procurementPrice.toFixed(2)}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">Sales Qty</p>
                              <p className="font-medium">{metric.salesQty}</p>
                            </div>

                            <div>
                              <p className="text-slate-500">Sales Price</p>
                              <p className="font-medium">
                                ${metric.salesPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}