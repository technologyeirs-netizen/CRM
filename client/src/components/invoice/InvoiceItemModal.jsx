import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { productService } from "../../services/productService";

export default function InvoiceItemModal({
  showItemModal,
  setShowItemModal,
  itemFilters,
  setItemFilters,
  handleAddItemClick,
}) {
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsApiList, setProductsApiList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Qty chosen for each product before it is added to the bill
  const [qtyMap, setQtyMap] = useState({});

  useEffect(() => {
    if (!showItemModal) return;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);

        const response = await productService.getAll({
          page: 1,
          limit: 500,
        });

        const products = response?.data?.products || [];

        setProductsApiList(products);

        const uniqueCategories = [
          ...new Map(
            products
              .filter((product) => product.category)
              .map((product) => [
                typeof product.category === "object"
                  ? product.category._id
                  : product.category,
                typeof product.category === "object"
                  ? product.category
                  : {
                      _id: product.category,
                      name: product.category,
                    },
              ]),
          ).values(),
        ];

        setCategories(uniqueCategories);
      } catch (err) {
        console.log(err);
      } finally {
        setProductsLoading(false);
      }
    };

    loadProducts();
  }, [showItemModal]);

  const filteredProducts = productsApiList.filter((product) => {
    const search = itemFilters?.search?.toLowerCase() || "";

    const matchesSearch =
      product?.productName?.toLowerCase().includes(search) ||
      product?.brand?.toLowerCase().includes(search) ||
      product?.hsn?.toLowerCase().includes(search) ||
      product?.modelNo?.toLowerCase().includes(search);

    const matchesCategory =
      !selectedCategory ||
      product?.category?._id === selectedCategory ||
      product?.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getQty = (product) => qtyMap[product._id] || 1;

  const setQty = (product, value) => {
    const stock = Number(product.stock || 0);
    let qty = Number(value) || 1;

    if (qty < 1) qty = 1;
    if (stock > 0 && qty > stock) qty = stock;

    setQtyMap((prev) => ({ ...prev, [product._id]: qty }));
  };

  const onAdd = (product) => {
    const stock = Number(product.stock || 0);

    if (stock <= 0) return; // out of stock, do not allow adding

    handleAddItemClick(product, getQty(product));

    // reset qty for next time this modal opens
    setQtyMap((prev) => ({ ...prev, [product._id]: 1 }));
  };

  if (!showItemModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="text-lg font-bold text-gray-800">Add Products to Bill</h3>
          <button
            onClick={() => setShowItemModal(false)}
            className="text-gray-400 hover:text-red-500 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-7 relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by Product / Brand / HSN code / Model No / Category"
              value={itemFilters.search}
              onChange={(e) =>
                setItemFilters({
                  ...itemFilters,
                  search: e.target.value,
                })
              }
              className="w-full border border-purple-300 rounded pl-9 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200 bg-white"
            />
            <span className="absolute right-3 top-2.5 text-gray-400 cursor-pointer">
              🔲
            </span>
          </div>
          <div className="md:col-span-3">
            {/* CATEGORY FILTER */}
            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white outline-none text-gray-600"
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="md:col-span-2">
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded text-sm transition">
              Create New Product
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-500 font-semibold tracking-wider uppercase sticky top-0 z-10">
                <th className="p-3">Product Name</th>
                <th className="p-3">HSN / Model</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Sales Price</th>
                <th className="p-3">Qty</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {productsLoading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stock = Number(product.stock || 0);
                  const outOfStock = stock <= 0;

                  return (
                    <tr
                      key={product._id}
                      className={`hover:bg-indigo-50/40 transition ${
                        outOfStock ? "opacity-60" : ""
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.productName}
                              className="w-10 h-10 rounded object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                              📦
                            </div>
                          )}

                          <div>
                            <div className="font-semibold text-gray-900">
                              {product.productName}
                            </div>

                            <div className="text-xs text-gray-500">
                              {product.brand || "No Brand"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-gray-500 font-mono">
                        {product.hsn || product.modelNo || "—"}
                      </td>

                      <td className="p-3 font-medium">
                        {outOfStock ? (
                          <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wide">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="text-gray-600">{stock}</span>
                        )}
                      </td>

                      <td className="p-3 text-green-700 font-semibold">
                        ₹ {Number(product.price || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min={1}
                          max={stock > 0 ? stock : 1}
                          disabled={outOfStock}
                          value={getQty(product)}
                          onChange={(e) => setQty(product, e.target.value)}
                          className="w-16 border border-gray-200 rounded px-2 py-1 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => onAdd(product)}
                          disabled={outOfStock}
                          className={`px-4 py-2 border rounded transition ${
                            outOfStock
                              ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                              : "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          {outOfStock ? "Unavailable" : "+ Add"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center space-x-4">
            <p>
              Keyboard Shortcuts :{" "}
              <span className="bg-white border px-1.5 py-0.5 rounded shadow-sm font-semibold">
                Change Quantity
              </span>{" "}
              <span className="bg-gray-200 px-1 py-0.5 rounded font-mono text-gray-700">
                Enter
              </span>
            </p>
            <p>
              Move between items{" "}
              <span className="bg-white border px-1 py-0.5 rounded shadow-sm">
                ↑
              </span>{" "}
              <span className="bg-white border px-1 py-0.5 rounded shadow-sm">
                ↓
              </span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowItemModal(false)}
              className="border border-gray-300 rounded px-4 py-1.5 bg-white text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel [ESC]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
