import React, { useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiUploadCloud,
  FiPackage,
  FiInfo,
  FiLayers,
  FiDollarSign,
} from "react-icons/fi";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import { itemService } from "../../services/itemService";
import { categoryService } from "../../services/categoryService";
import { subCategoryService } from "../../services/subCategoryService";

const initialForm = {
  productName: "",
  hsn: "",
  category: "",
  subCategory: "",
  brand: "",
  description: "",
  modelNo: "",
  images: [],
  price: 0,
  stock: 0,
  isFeatured: false,
  discount: 0,
};

export default function Product() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);

    try {
      const [p, c, s] = await Promise.all([
        itemService.getAll({ page: 1, limit: 500 }),
        categoryService.getAll({ page: 1, limit: 500 }),
        subCategoryService.getAll({ page: 1, limit: 500 }),
      ]);
      console.log("ITEM RESPONSE =>", p.data);
      console.log("PRODUCTS =>", p.data.products);
      console.log("ITEMS =>", p.data.items);
      console.log("DATA =>", p.data.data);

      setProducts(p.data.products || p.data.items || []);

      setCategories(c.data.categories || []);

      setSubCategories(s.data.subcategories || s.data.data || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load products");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!form.category) {
      setFilteredSubCategories([]);
      return;
    }

    const filtered = subCategories.filter(
      (sub) =>
        sub.category?._id === form.category || sub.category === form.category,
    );

    setFilteredSubCategories(filtered);
  }, [form.category, subCategories]);

  // existing load useEffect
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowModal(true);
  };
  const goLive = async (id) => {
    try {
      await itemService.goLive(id);
      toast.success("Product Live Successfully");
      load();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to make product live",
      );
    }
  };

  const openEdit = (item) => {
    console.log("EDIT ITEM =>", item);
    setEditingId(item._id);

    setForm({
      productName: item.name || "",
      hsn: item.hsnCode || "",
      category: item.category?._id || "",
      subCategory: item.subCategory?._id || "",
      brand: item.brand || "",
      description: item.description || "",
      modelNo: item.modelNo || "",
      images: item.images || [],
      price: item.salesPrice || 0,
      stock: item.openingStock || 0,
      discount: item.discountOnSalesPrice || 0,
      isFeatured: item.isFeatured || false,
    });

    setShowModal(true);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "category" ? { subCategory: "" } : {}),
    }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + form.images.length > 5) {
      return toast.error("Only 5 images allowed");
    }

    const readers = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((imgs) => {
      setForm((p) => ({
        ...p,
        images: [...p.images, ...imgs],
      }));
    });
  };

  const removeImage = (index) => {
    const updated = form.images.filter((_, i) => i !== index);
    setForm((p) => ({ ...p, images: updated }));
  };

  const save = async () => {
    if (!form.productName.trim()) {
      return toast.error("Product name required");
    }

    try {
      if (editingId) {
        await itemService.update(editingId, form);
        toast.success("Product updated");
      } else {
        await itemService.create(form);
        toast.success("Product created");
      }

      setShowModal(false);
      load();
    } catch {
      toast.error("Save failed");
    }
  };

  const del = async (id) => {
    if (!confirm("Delete product?")) return;
    await itemService.delete(id);
    toast.success("Deleted");
    load();
  };

  if (loading) return <Spinner text="Loading products dashboard..." />;
  console.log(products);

  return (
    <div style={styles.pageContainer}>
      {/* INJECTED INLINE CSS STYLES FOR DYNAMIC ELEMENTS */}
      <style>{customCSS}</style>

      {/* DASHBOARD HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.headerTitle}>Products Directory</h2>
          <p style={styles.headerSubtitle}>
            Manage your catalog items, pricing, and active inventory
          </p>
        </div>
        <button
          className="modern-btn-primary"
          style={styles.createBtn}
          onClick={openCreate}
        >
          <FiPlus size={18} /> Add Product
        </button>
      </div>

      {/* PRODUCTS DISPLAY TABLE */}
      <div style={styles.cardContainer}>
        {products.length === 0 ? (
          <div style={styles.emptyState}>
            <FiPackage size={48} color="#94a3b8" />
            <p style={{ marginTop: 12, fontWeight: 500, color: "#64748b" }}>
              No products found
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Product Details</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Brand Details</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Stock Status</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p._id}
                    className="table-row-hover"
                    style={styles.tableBodyRow}
                  >
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={styles.thumbnailContainer}>
                          {p.images && p.images[0] ? (
                            <img
                              src={p.images[0]}
                              alt=""
                              style={styles.tableThumbnail}
                            />
                          ) : (
                            <FiPackage size={18} color="#94a3b8" />
                          )}
                        </div>
                        <div>
                          <span style={styles.productNameText}>{p.name}</span>

                          {p.hsnCode && (
                            <div style={styles.subBadge}>HSN: {p.hsnCode}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>
                        {typeof p.category === "object"
                          ? p.category?.name
                          : p.category || "Uncategorized"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 500, color: "#334155" }}>
                        {p.brand || "—"}
                      </span>
                      {p.modelNo && (
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          M/N: {p.modelNo}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.priceText}>
                        ₹{Number(p.salesPrice || 0).toLocaleString("en-IN")}
                      </span>

                      {p.discountOnSalesPrice > 0 && (
                        <span style={styles.discountIndicator}>
                          -{p.discountOnSalesPrice}%
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span style={styles.stockStatusDot(p.openingStock)} />

                        <span
                          style={{
                            fontWeight: 600,
                            color: p.openingStock > 0 ? "#1e293b" : "#ef4444",
                          }}
                        >
                          Qty: {p.openingStock || 0}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        {!p.isLive && (
                          <button
                            onClick={() => goLive(p._id)}
                            style={{
                              background: "#22c55e",
                              color: "#fff",
                              border: "none",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            Go Live
                          </button>
                        )}

                        {p.isLive && (
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#15803d",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontWeight: 600,
                            }}
                          >
                            Live
                          </span>
                        )}

                        <button
                          onClick={() => openEdit(p)}
                          className="action-btn action-btn-edit"
                          style={styles.actionBtn}
                        >
                          <FiEdit2 size={15} />
                        </button>

                        <button
                          onClick={() => del(p._id)}
                          className="action-btn action-btn-delete"
                          style={styles.actionBtn}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODERNIZED split pane MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Modify Product Listing" : "Create New Product"}
        size="xl"
        footer={
          <div style={styles.modalFooter}>
            <button
              className="modern-btn-secondary"
              style={styles.footerCancelBtn}
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              className="modern-btn-primary"
              style={styles.footerSaveBtn}
              onClick={save}
            >
              <FiSave /> Secure Save
            </button>
          </div>
        }
      >
        <div style={styles.modalSplitWrapper}>
          {/* LEFT SIDE: MODERN STUDIO IMAGE UPLOAD */}
          <div style={styles.modalLeftStudio}>
            <h4 style={styles.studioTitle}>
              <FiUploadCloud /> Media Gallery
            </h4>
            <p style={styles.studioSubtitle}>
              Upload up to 5 clear asset images. First asset is default
              thumbnail.
            </p>

            <label className="upload-dropzone" style={styles.dropzone}>
              <FiUploadCloud size={32} color="#4f46e5" />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#1e293b",
                  marginTop: 8,
                }}
              >
                Click to choose files
              </span>
              <span style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                PNG, JPG or WEBP up to 5MB
              </span>
              <input
                type="file"
                multiple
                hidden
                accept="image/*"
                onChange={handleImages}
              />
            </label>

            {form.images.length > 0 && (
              <div style={styles.imageGridPreview}>
                {form.images.map((img, i) => (
                  <div
                    key={i}
                    className="preview-image-card"
                    style={styles.imageCard}
                  >
                    <img src={img} alt="" style={styles.previewImage} />
                    {i === 0 && <span style={styles.coverBadge}>Cover</span>}
                    <button
                      onClick={() => removeImage(i)}
                      style={styles.imageDeleteBtn}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: BEAUTIFULLY GROUPED METADATA FORM */}
          <div style={styles.modalRightForm}>
            {/* Group 1: Identity */}
            <div style={styles.formSection}>
              <h4 style={styles.sectionHeading}>
                <FiInfo size={16} /> General Info
              </h4>
              <div style={styles.formGrid}>
                <div style={{ ...styles.inputWrapper, gridColumn: "1 / -1" }}>
                  <label style={styles.inputLabel}>Product Title *</label>
                  <input
                    className="modern-input"
                    placeholder="e.g. Wireless Mechanical Keyboard Pro"
                    value={form.productName}
                    onChange={(e) =>
                      handleChange("productName", e.target.value)
                    }
                  />
                </div>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>HSN Code</label>
                  <input
                    className="modern-input"
                    placeholder="e.g. 84716040"
                    value={form.hsn}
                    onChange={(e) => handleChange("hsn", e.target.value)}
                  />
                </div>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Model Number</label>
                  <input
                    className="modern-input"
                    placeholder="e.g. KB-2026X"
                    value={form.modelNo}
                    onChange={(e) => handleChange("modelNo", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Taxonomy & Classification */}
            <div style={styles.formSection}>
              <h4 style={styles.sectionHeading}>
                <FiLayers size={16} /> Classification
              </h4>
              <div style={styles.formGrid}>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Category</label>
                  <select
                    className="modern-input"
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Sub Category</label>

                  <select
                    className="modern-input"
                    value={form.subCategory}
                    onChange={(e) =>
                      handleChange("subCategory", e.target.value)
                    }
                    disabled={!form.category}
                  >
                    <option value="">Select Sub Category</option>

                    {filteredSubCategories.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Brand Manufacturer</label>
                  <input
                    className="modern-input"
                    placeholder="e.g. Logitech, Apple"
                    value={form.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Financials & Stock */}
            <div style={styles.formSection}>
              <h4 style={styles.sectionHeading}>
                <FiDollarSign size={16} /> Pricing & Stock Matrix
              </h4>
              <div style={styles.formGrid}>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Price (INR)</label>
                  <div style={{ position: "relative" }}>
                    <span style={styles.prefixIcon}>₹</span>
                    <input
                      type="number"
                      className="modern-input"
                      style={{ paddingLeft: 28 }}
                      placeholder="0.00"
                      value={form.price || ""}
                      onChange={(e) =>
                        handleChange("price", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Discount Percentage</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      className="modern-input"
                      placeholder="0"
                      value={form.discount || ""}
                      onChange={(e) =>
                        handleChange("discount", Number(e.target.value))
                      }
                    />
                    <span style={styles.suffixIcon}>%</span>
                  </div>
                </div>
                <div style={{ ...styles.inputWrapper, gridColumn: "1 / -1" }}>
                  <label style={styles.inputLabel}>Inventory Stock Units</label>
                  <input
                    type="number"
                    className="modern-input"
                    placeholder="Available count"
                    value={form.stock || ""}
                    onChange={(e) =>
                      handleChange("stock", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Group 4: Rich Extras */}
            <div style={styles.formSection}>
              <h4 style={styles.sectionHeading}>Additional Fields</h4>
              <div style={styles.inputWrapper}>
                <label style={styles.inputLabel}>
                  Product Specifications / Description
                </label>
                <textarea
                  className="modern-input"
                  rows={4}
                  style={{ resize: "vertical", minHeight: 80 }}
                  placeholder="Provide an engaging and analytical breakdown of product metrics..."
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              <div style={{ mt: 15 }}>
                <label
                  className="checkbox-container"
                  style={styles.checkboxLabel}
                >
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      handleChange("isFeatured", e.target.checked)
                    }
                    style={styles.checkboxInput}
                  />
                  <div>
                    <span
                      style={{
                        fontWeight: 600,
                        color: "#1e293b",
                        display: "block",
                      }}
                    >
                      Mark as Featured Product
                    </span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>
                      This item will be highlighted on home carousels and
                      feature tabs.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

/* INTERACTIVE STYLING SPECIFICATIONS OBJECT */
const styles = {
  pageContainer: {
    padding: "32px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
  },
  headerTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  createBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
  },
  cardContainer: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
    overflow: "hidden",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHeaderRow: {
    background: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0",
  },
  th: {
    padding: "16px 20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableBodyRow: {
    borderBottom: "1px solid #f1f5f9",
    transition: "all 0.2s ease",
  },
  td: {
    padding: "16px 20px",
    verticalAlign: "middle",
    fontSize: "14px",
    color: "#334155",
  },
  thumbnailContainer: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },
  tableThumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  productNameText: {
    fontWeight: "600",
    color: "#0f172a",
    display: "block",
  },
  subBadge: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "2px",
  },
  categoryBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "4px 10px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "500",
  },
  priceText: {
    fontWeight: "600",
    color: "#0f172a",
  },
  discountIndicator: {
    marginLeft: "6px",
    background: "#dcfce7",
    color: "#15803d",
    fontSize: "11px",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "600",
  },
  stockStatusDot: (stock) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: stock > 10 ? "#22c55e" : stock > 0 ? "#f59e0b" : "#ef4444",
  }),
  actionBtn: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease",
  },

  /* MODAL MODERN REARCHITECTING Styles */
  modalSplitWrapper: {
    display: "grid",
    gridTemplateColumns: "1fr 1.3fr",
    gap: "32px",
    alignItems: "start",
    padding: "10px 5px",
    maxHeight: "70vh",
    overflowY: "auto",
  },
  modalLeftStudio: {
    position: "sticky",
    top: 0,
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  studioTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
    margin: "0 0 4px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  studioSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0 0 16px 0",
    lineHeight: "1.4",
  },
  dropzone: {
    border: "2px dashed #cbd5e1",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "32px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  imageGridPreview: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(75px, 1fr))",
    gap: "12px",
    marginTop: "20px",
  },
  imageCard: {
    position: "relative",
    aspectRatio: "1/1",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  coverBadge: {
    position: "absolute",
    bottom: "4px",
    left: "4px",
    background: "#4f46e5",
    color: "#ffffff",
    fontSize: "9px",
    fontWeight: "700",
    padding: "1px 5px",
    borderRadius: "3px",
    textTransform: "uppercase",
  },
  imageDeleteBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    background: "rgba(239, 68, 68, 0.9)",
    color: "#ffffff",
    border: "none",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(4px)",
  },
  modalRightForm: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  formSection: {
    background: "#ffffff",
    borderRadius: "8px",
  },
  sectionHeading: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4f46e5",
    margin: "0 0 14px 0",
    paddingBottom: "6px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inputLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#475569",
  },
  prefixIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontWeight: "500",
  },
  suffixIcon: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontWeight: "500",
  },
  checkboxLabel: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    cursor: "pointer",
    background: "#f0fdf4",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #bbf7d0",
  },
  checkboxInput: {
    marginTop: "4px",
    width: "16px",
    height: "16px",
    accentColor: "#22c55e",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    width: "100%",
  },
  footerCancelBtn: {
    padding: "10px 20px",
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  footerSaveBtn: {
    padding: "10px 24px",
    borderRadius: "8px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
  },
};

/* RAW CSS FOR INJECTION: Handles Interactive Hover states natively */
const customCSS = `
  .modern-btn-primary {
    background: #4f46e5;
    color: white;
    transition: background 0.2s ease, transform 0.1s ease;
  }
  .modern-btn-primary:hover {
    background: #4338ca;
    transform: translateY(-1px);
  }
  .modern-btn-secondary:hover {
    background: #e2e8f0 !important;
  }
  .table-row-hover:hover {
    background-color: #f8fafc;
  }
  .action-btn-edit:hover {
    color: #4f46e5;
    border-color: #4f46e5;
    background: #eef2ff;
  }
  .action-btn-delete:hover {
    color: #ef4444;
    border-color: #fca5a5;
    background: #fef2f2;
  }
  .upload-dropzone:hover {
    border-color: #4f46e5 !important;
    background: #f5f3ff !important;
  }
  .modern-input {
    width: 100%;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    font-size: 14px;
    color: #1e293b;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .modern-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
  }
  .preview-image-card:hover button {
    opacity: 1 !important;
  }
`;
