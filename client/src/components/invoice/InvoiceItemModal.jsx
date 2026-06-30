import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { itemService } from "../../services/itemService";

export default function InvoiceItemModal({
  showItemModal,
  setShowItemModal,
  itemFilters,
  setItemFilters,
  handleAddItemClick,
}) {
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsApiList, setItemsApiList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!showItemModal) return;

    const loadItems = async () => {
      try {
        setItemsLoading(true);

        const response = await itemService.getAll({
          page: 1,
          limit: 500,
        });

        const items =
          response?.data?.products ||
          response?.data?.items ||
          response?.data?.data ||
          [];

        setItemsApiList(items);

        const uniqueCategories = [
          ...new Map(
            items
              .filter((item) => item.category)
              .map((item) => [
                typeof item.category === "object"
                  ? item.category._id
                  : item.category,
                typeof item.category === "object"
                  ? item.category
                  : {
                      _id: item.category,
                      name: item.category,
                    },
              ]),
          ).values(),
        ];

        setCategories(uniqueCategories);
      } catch (err) {
        console.log(err);
      } finally {
        setItemsLoading(false);
      }
    };

    loadItems();
  }, [showItemModal]);

  const filteredItems = itemsApiList.filter((item) => {
    const search = itemFilters?.search?.toLowerCase() || "";

    const matchesSearch =
      item?.name?.toLowerCase().includes(search) ||
      item?.brand?.toLowerCase().includes(search) ||
      item?.hsnCode?.toLowerCase().includes(search) ||
      item?.itemCode?.toLowerCase().includes(search);

    const matchesCategory =
      !selectedCategory ||
      item?.category?._id === selectedCategory ||
      item?.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (!showItemModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white w-full max-w-5xl rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="text-lg font-bold text-gray-800">Add Items to Bill</h3>
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
              placeholder="Search by Item/ Serial no./ HSN code/ SKU/ Custom Field / Category"
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
              Create New Item
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-500 font-semibold tracking-wider uppercase sticky top-0 z-10">
                <th className="p-3">Item Name</th>
                <th className="p-3">Item Code</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Sales Price</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {itemsLoading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    Loading items...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-indigo-50/40 transition"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-10 h-10 rounded object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                            📦
                          </div>
                        )}

                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.name}
                          </div>

                          <div className="text-xs text-gray-500">
                            {item.brand || "No Brand"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 text-gray-500 font-mono">
                      {item.hsnCode || item.itemCode || "—"}
                    </td>

                    <td className="p-3 font-medium text-gray-600">
                      {item.openingStock || 0}
                    </td>

                    <td className="p-3 text-green-700 font-semibold">
                      ₹ {Number(item.salesPrice || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleAddItemClick(item)}
                        className="px-4 py-2 border border-blue-200 text-blue-600 bg-blue-50 rounded hover:bg-blue-600 hover:text-white transition"
                      >
                        + Add
                      </button>
                    </td>
                  </tr>
                ))
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
            <span className="text-blue-600 font-medium hover:underline cursor-pointer">
              Show 0 Item(s) Selected
            </span>
            <button
              onClick={() => setShowItemModal(false)}
              className="border border-gray-300 rounded px-4 py-1.5 bg-white text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel [ESC]
            </button>
            <button className="bg-indigo-100 text-indigo-400 font-semibold px-4 py-1.5 rounded cursor-not-allowed">
              Add to Bill [F7]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
