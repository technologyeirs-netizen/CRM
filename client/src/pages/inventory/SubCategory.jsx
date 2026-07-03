import React, { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import toast from "react-hot-toast";

import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";

import { categoryService } from "../../services/categoryService";
import { subCategoryService } from "../../services/subCategoryService";

const SubCategoryPage = () => {
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    category: "",
    name: "",
    description: "",
  });

 
const loadData = async () => {
  setLoading(true);

  try {
    const [subRes, catRes] = await Promise.all([
      subCategoryService.getAll({
        page: 1,
        limit: 500,
      }),
      categoryService.getAll({
        page: 1,
        limit: 500,
      }),
    ]);

    console.log("SUBCATEGORY RESPONSE:", subRes.data);
    console.log("CATEGORY RESPONSE:", catRes.data);

    console.log("SUBCATEGORY RESPONSE:", subRes.data);

setSubCategories(
  Array.isArray(subRes.data.subcategories)
    ? subRes.data.subcategories
    : []
);

setCategories(
  Array.isArray(catRes.data.categories)
    ? catRes.data.categories
    : []
);

    setCategories(
      Array.isArray(catRes.data.categories)
        ? catRes.data.categories
        : []
    );
  } catch (error) {
    console.log("SUBCATEGORY ERROR", error);
    console.log("RESPONSE", error.response?.data);

    toast.error(
      error.response?.data?.message ||
      error.message ||
      "Failed to load sub categories"
    );
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    loadData();
  }, []);

  const filteredSubCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return subCategories.filter((item) => {
      const matchesSearch =
        !term ||
        [
          item.name,
          item.description,
          item.category?.name,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(term)
          );

      const matchesCategory =
        categoryFilter === "all" ||
        item.category?._id === categoryFilter;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    subCategories,
    searchTerm,
    categoryFilter,
  ]);

  const openCreateForm = () => {
    setEditingId(null);

    setForm({
      category: "",
      name: "",
      description: "",
    });

    setShowModal(true);
  };

  const openEditForm = (item) => {
    setEditingId(item._id);

    setForm({
      category:
        item.category?._id ||
        item.category ||
        "",
      name: item.name || "",
      description:
        item.description || "",
    });

    setShowModal(true);
  };

  const handleChange = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveSubCategory =
    async () => {
      if (!form.category) {
        toast.error(
          "Please select category"
        );
        return;
      }

      if (!form.name.trim()) {
        toast.error(
          "Sub category name is required"
        );
        return;
      }

      try {
        if (editingId) {
          await subCategoryService.update(
            editingId,
            form
          );

          toast.success(
            "Sub category updated successfully"
          );
        } else {
          await subCategoryService.create(
            form
          );

          toast.success(
            "Sub category created successfully"
          );
        }

        setShowModal(false);
        await loadData();
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to save sub category"
        );
      }
    };

  const deleteSubCategory =
    async (id) => {
      if (
        !window.confirm(
          "Delete this sub category?"
        )
      )
        return;

      try {
        await subCategoryService.delete(id);

        toast.success(
          "Sub category deleted successfully"
        );

        await loadData();
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to delete sub category"
        );
      }
    };

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
  };

  if (loading) {
    return (
      <Spinner text="Loading sub categories..." />
    );
  }


  
  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>
            Sub Category Management
          </h1>
          <p>
            Manage product sub
            categories
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateForm}
        >
          <FiPlus />
          Add Sub Category
        </button>
      </div>

      {/* FILTERS */}
      <div
        className="card"
        style={{ marginBottom: 20 }}
      >
        <div className="card-body quotation-grid">
          <div
            className="form-group"
            style={{
              gridColumn: "1 / -1",
            }}
          >
            <label className="form-label">
              Search
            </label>

            <input
              className="form-control"
              placeholder="Search sub category..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Category
            </label>

            <select
              className="form-control"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                )
              )}
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

      {/* TABLE */}
      <div className="card">
        <div className="card-header">
          <h3>Sub Categories</h3>

          <span className="badge badge-info">
            {
              filteredSubCategories.length
            }{" "}
            / {subCategories.length}
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>
                  Sub Category
                </th>
                <th>Category</th>
                <th>
                  Description
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSubCategories.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign:
                        "center",
                      color:
                        "#64748b",
                    }}
                  >
                    No sub categories
                    found.
                  </td>
                </tr>
              ) : (
                filteredSubCategories.map(
                  (item) => (
                    <tr
                      key={item._id}
                    >
                      <td>
                        <strong>
                          {
                            item.name
                          }
                        </strong>
                      </td>

                      <td>
                        {item
                          .category
                          ?.name ||
                          "N/A"}
                      </td>

                      <td>
                        {item.description ||
                          "N/A"}
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: 8,
                          }}
                        >
                          <button
                            className="btn btn-secondary btn-icon btn-sm"
                            onClick={() =>
                              openEditForm(
                                item
                              )
                            }
                          >
                            <FiEdit2 size={14} />
                          </button>

                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() =>
                              deleteSubCategory(
                                item._id
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

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() =>
          setShowModal(false)
        }
        title={
          editingId
            ? "Edit Sub Category"
            : "Add Sub Category"
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
                setShowModal(false)
              }
            >
              Cancel
            </button>

            <button
              className="btn btn-primary"
              onClick={
                saveSubCategory
              }
            >
              <FiSave />
              Save Sub Category
            </button>
          </div>
        }
      >
        <div className="quotation-grid">
          <div className="form-group">
            <label className="form-label">
              Category
            </label>

            <select
              className="form-control"
              value={form.category}
              onChange={(e) =>
                handleChange(
                  "category",
                  e.target.value
                )
              }
            >
              <option value="">
                Select Category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category._id
                    }
                    value={
                      category._id
                    }
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Sub Category Name
            </label>

            <input
              className="form-control"
              value={form.name}
              onChange={(e) =>
                handleChange(
                  "name",
                  e.target.value
                )
              }
            />
          </div>

          <div
            className="form-group"
            style={{
              gridColumn:
                "1 / -1",
            }}
          >
            <label className="form-label">
              Description
            </label>

            <textarea
              rows={4}
              className="form-control"
              value={
                form.description
              }
              onChange={(e) =>
                handleChange(
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

export default SubCategoryPage;