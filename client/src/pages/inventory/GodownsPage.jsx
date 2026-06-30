import React, { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import { godownService } from "../../services/godownService";

const initialGodownForm = {
  name: "",
  streetAddress: "",
  state: "",
  city: "",
  pincode: "",
};

const GodownsPage = () => {
  const [loading, setLoading] = useState(true);
  const [godowns, setGodowns] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(initialGodownForm);

  const loadGodowns = async () => {
    setLoading(true);

    try {
      const response = await godownService.getAll({
        page: 1,
        limit: 500,
      });

      setGodowns(
        Array.isArray(response.data.godowns)
          ? response.data.godowns
          : []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to load godowns"
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    loadGodowns();
  }, []);

  const filteredGodowns = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return godowns.filter((godown) => {
      const matchesSearch =
        !term ||
        [
          godown.name,
          godown.streetAddress,
          godown.city,
          godown.state,
          godown.pincode,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(term)
          );

      const matchesState =
        stateFilter === "all" ||
        godown.state === stateFilter;

      const matchesCity =
        cityFilter === "all" ||
        godown.city === cityFilter;

      return matchesSearch && matchesState && matchesCity;
    });
  }, [
    godowns,
    searchTerm,
    stateFilter,
    cityFilter,
  ]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(initialGodownForm);
    setShowModal(true);
  };

  const openEditForm = (godown) => {
    setEditingId(godown._id);

    setForm({
      name: godown.name || "",
      streetAddress: godown.streetAddress || "",
      state: godown.state || "",
      city: godown.city || "",
      pincode: godown.pincode || "",
    });

    setShowModal(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveGodown = async () => {
    if (!form.name.trim()) {
      toast.error("Godown name is required");
      return;
    }

    try {
      if (editingId) {
        await godownService.update(editingId, form);
        toast.success("Godown updated successfully");
      } else {
        await godownService.create(form);
        toast.success("Godown created successfully");
      }

      setShowModal(false);
      await loadGodowns();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save godown"
      );
    }
  };

  const deleteGodown = async (id) => {
    if (!window.confirm("Delete this godown?")) return;

    try {
      await godownService.delete(id);

      toast.success("Godown deleted successfully");

      await loadGodowns();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete godown"
      );
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStateFilter("all");
    setCityFilter("all");
  };

  if (loading) {
    return <Spinner text="Loading godowns..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Godown Management</h1>
          <p>Manage all godowns</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={openCreateForm}
        >
          <FiPlus /> Add Godown
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
              placeholder="Search godown..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              State
            </label>

            <select
              className="form-control"
              value={stateFilter}
              onChange={(e) =>
                setStateFilter(e.target.value)
              }
            >
              <option value="all">
                All States
              </option>

              {[
                ...new Set(
                  godowns
                    .map((g) => g.state)
                    .filter(Boolean)
                ),
              ].map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              City
            </label>

            <select
              className="form-control"
              value={cityFilter}
              onChange={(e) =>
                setCityFilter(e.target.value)
              }
            >
              <option value="all">
                All Cities
              </option>

              {[
                ...new Set(
                  godowns
                    .map((g) => g.city)
                    .filter(Boolean)
                ),
              ].map((city) => (
                <option
                  key={city}
                  value={city}
                >
                  {city}
                </option>
              ))}
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
          <h3>Godowns</h3>

          <span className="badge badge-info">
            {filteredGodowns.length} /{" "}
            {godowns.length}
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Pincode</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredGodowns.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                    }}
                  >
                    No godowns found
                  </td>
                </tr>
              ) : (
                filteredGodowns.map(
                  (godown) => (
                    <tr key={godown._id}>
                      <td>
                        <strong>
                          {godown.name}
                        </strong>
                      </td>

                      <td>
                        {godown.streetAddress ||
                          "N/A"}
                      </td>

                      <td>
                        {godown.city || "N/A"}
                      </td>

                      <td>
                        {godown.state || "N/A"}
                      </td>

                      <td>
                        {godown.pincode ||
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
                              openEditForm(
                                godown
                              )
                            }
                          >
                            <FiEdit2 size={14} />
                          </button>

                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() =>
                              deleteGodown(
                                godown._id
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
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingId
            ? "Edit Godown"
            : "Add Godown"
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
              onClick={saveGodown}
            >
              <FiSave /> Save Godown
            </button>
          </div>
        }
      >
        <div className="quotation-grid">
          <div className="form-group">
            <label className="form-label">
              Name
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

          <div className="form-group">
            <label className="form-label">
              Address
            </label>

            <input
              className="form-control"
              value={form.streetAddress}
              onChange={(e) =>
                handleChange(
                  "streetAddress",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              City
            </label>

            <input
              className="form-control"
              value={form.city}
              onChange={(e) =>
                handleChange(
                  "city",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              State
            </label>

            <input
              className="form-control"
              value={form.state}
              onChange={(e) =>
                handleChange(
                  "state",
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Pincode
            </label>

            <input
              className="form-control"
              value={form.pincode}
              onChange={(e) =>
                handleChange(
                  "pincode",
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

export default GodownsPage;