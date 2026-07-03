import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import { categoryService } from "../../services/categoryService";

const CategoriesPage = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [categoryForm, setCategoryForm] = useState({
    itemType: "product",
    name: "",
    description: "",
  });

  const loadCategories = async () => {
    setLoading(true);

    try {
      const response = await categoryService.getAll({
        page: 1,
        limit: 500,
      });

      setCategories(
        Array.isArray(response.data.categories)
          ? response.data.categories
          : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load categories"
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !term ||
        [
          category.name,
          category.description,
          category.itemType,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(term)
          );

      const matchesType =
        itemTypeFilter === "all" ||
        category.itemType === itemTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [categories, searchTerm, itemTypeFilter]);

  const openCreateCategoryForm = () => {
    setEditingCategoryId(null);

    setCategoryForm({
      itemType: "product",
      name: "",
      description: "",
    });

    setShowCategoryModal(true);
  };

  const openEditCategoryForm = (category) => {
    setEditingCategoryId(category._id);

    setCategoryForm({
      itemType: category.itemType || "product",
      name: category.name || "",
      description: category.description || "",
    });

    setShowCategoryModal(true);
  };

  const handleCategoryFormChange = (field, value) => {
    setCategoryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategoryId) {
        await categoryService.update(
          editingCategoryId,
          categoryForm
        );

        toast.success("Category updated successfully");
      } else {
        await categoryService.create(categoryForm);

        toast.success("Category created successfully");
      }

      setShowCategoryModal(false);
      await loadCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save category"
      );
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await categoryService.delete(categoryId);

      toast.success("Category deleted successfully");

      await loadCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setItemTypeFilter("all");
  };

  if (loading) {
    return <Spinner text="Loading categories..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Category Management</h1>
          <p>
            Manage product and service categories
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateCategoryForm}
        >
          <FiPlus /> Add Category
        </button>
      </div>

      <div
        className="card"
        style={{ marginBottom: 20 }}
      >
        <div className="card-body quotation-grid">
          <div
            className="form-group"
            style={{ gridColumn: "1 / -1" }}
          >
            <label className="form-label">
              Search
            </label>

            <input
              className="form-control"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Category Type
            </label>

            <select
              className="form-control"
              value={itemTypeFilter}
              onChange={(e) =>
                setItemTypeFilter(e.target.value)
              }
            >
              <option value="all">
                All Types
              </option>
              <option value="product">
                Product
              </option>
              <option value="service">
                Service
              </option>
            </select>
          </div>

          <div
            className="form-group"
            style={{
              display: "flex",
              alignItems: "end",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Categories</h3>

          <span className="badge badge-info">
            {filteredCategories.length} /{" "}
            {categories.length}
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    {categories.length === 0
                      ? "No categories created yet."
                      : "No categories match the current filters."}
                  </td>
                </tr>
              ) : (
                filteredCategories.map(
                  (category) => (
                    <tr key={category._id}>
                      <td>
                        <strong>
                          {category.name}
                        </strong>
                      </td>

                      <td
                        style={{
                          textTransform:
                            "capitalize",
                        }}
                      >
                        {category.itemType}
                      </td>

                      <td>
                        {category.description ||
                          "N/A"}
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                          }}
                        >
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() =>
                              openEditCategoryForm(
                                category
                              )
                            }
                          >
                            <FiEdit2 size={14} />
                          </button>

                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() =>
                              deleteCategory(
                                category._id
                              )
                            }
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={showCategoryModal}
        onClose={() =>
          setShowCategoryModal(false)
        }
        title={
          editingCategoryId
            ? "Edit Category"
            : "Add Category"
        }
        size="lg"
        footer={
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              width: "100%",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() =>
                setShowCategoryModal(false)
              }
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={saveCategory}
            >
              <FiSave /> Save Category
            </button>
          </div>
        }
      >
        <div className="quotation-grid">
          <div className="form-group">
            <label className="form-label">
              Category Type
            </label>

            <select
              className="form-control"
              value={categoryForm.itemType}
              onChange={(e) =>
                handleCategoryFormChange(
                  "itemType",
                  e.target.value
                )
              }
            >
              <option value="product">
                Product
              </option>
              <option value="service">
                Service
              </option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Category Name
            </label>

            <input
              className="form-control"
              value={categoryForm.name}
              onChange={(e) =>
                handleCategoryFormChange(
                  "name",
                  e.target.value
                )
              }
            />
          </div>

          <div
            className="form-group"
            style={{
              gridColumn: "1 / -1",
            }}
          >
            <label className="form-label">
              Description
            </label>

            <textarea
              rows={4}
              className="form-control"
              value={categoryForm.description}
              onChange={(e) =>
                handleCategoryFormChange(
                  "description",
                  e.target.value
                )
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesPage;