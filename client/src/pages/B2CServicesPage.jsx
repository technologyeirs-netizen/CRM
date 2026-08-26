import React, { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiSearch, FiTool, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import SingleImageUploader from '../components/common/SingleImageUploader';
import { b2cServiceService } from '../services/b2cServiceService';

const initialForm = {
  name: '',
  description: '',
  price: 0,
  image: '',
};

const B2CServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await b2cServiceService.getAll({ search });
      setServices(Array.isArray(res.data?.services) ? res.data.services : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load services');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditData(null);
    setFormData(initialForm);
    setShowForm(true);
  };

  const openEdit = (service) => {
    setEditData(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: Number(service.price || 0),
      image: service.image || '',
    });
    setShowForm(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...formData, price: Number(formData.price || 0) };
      if (editData?._id) {
        await b2cServiceService.update(editData._id, payload);
        toast.success('Service updated');
      } else {
        await b2cServiceService.create(payload);
        toast.success('Service created');
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete service "${name}"? It will disappear from the website and app.`)) return;
    try {
      await b2cServiceService.delete(id);
      toast.success('Service deleted');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Services</h1>
          <p>Bookable services shown on the website and the app — add/edit/delete reflects instantly on both.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Add Service
        </button>
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-control"
            style={{ paddingLeft: 34 }}
            placeholder="Search services"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Spinner text="Loading services..." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length ? services.map((service) => (
                  <tr key={service._id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {service.image ? (
                        <img src={service.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                      ) : (
                        <div className="stat-icon" style={{ background: 'var(--primary-light)', width: 40, height: 40 }}>
                          <FiTool color="var(--primary)" />
                        </div>
                      )}
                      <span style={{ fontWeight: 600 }}>{service.name}</span>
                    </td>
                    <td>Rs {Number(service.price || 0).toLocaleString()}</td>
                    <td style={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service.description}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(service)} title="Edit">
                          <FiEdit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(service._id, service.name)} title="Delete">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state"><h3>No services found</h3></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editData ? 'Edit Service' : 'Add Service'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" form="service-form" className="btn btn-primary">
              {editData ? 'Update Service' : 'Create Service'}
            </button>
          </>
        }
      >
        <form id="service-form" onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Service Name</label>
            <input
              className="form-control"
              required
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price (Rs)</label>
            <input
              type="number"
              className="form-control"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              required
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <SingleImageUploader
              title="Service Image"
              subtitle="Shown on the website and app service card"
              image={formData.image}
              onChange={(img) => setFormData((p) => ({ ...p, image: img }))}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default B2CServicesPage;
