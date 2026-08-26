import React, { useEffect, useState } from 'react';
import { FiEdit2, FiPlus, FiTrash2, FiArrowUp, FiArrowDown, FiSmartphone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import Modal from '../components/common/Modal';
import BannerImageUploader from '../components/common/BannerImageUploader';
import { b2cBannerService } from '../services/b2cBannerService';

const initialForm = {
  title: '',
  subtitle: '',
  image: '',
  imagePublicId: '',
  linkType: 'none',
  linkValue: '',
  placement: 'home_carousel',
  isActive: true,
};

const linkTypeOptions = [
  { value: 'none', label: 'No link' },
  { value: 'product', label: 'Product (paste product ID)' },
  { value: 'category', label: 'Category (paste category ID)' },
  { value: 'subcategory', label: 'Sub Category (paste subcategory ID)' },
  { value: 'service', label: 'Service (paste service ID)' },
  { value: 'url', label: 'External URL' },
];

const B2CBannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [placementFilter, setPlacementFilter] = useState('home_carousel');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await b2cBannerService.getAll();
      setBanners(Array.isArray(res.data?.banners) ? res.data.banners : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load banners');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditData(null);
    setFormData({ ...initialForm, placement: placementFilter });
    setShowForm(true);
  };

  const openEdit = (banner) => {
    setEditData(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      imagePublicId: banner.imagePublicId || '',
      linkType: banner.linkType || 'none',
      linkValue: banner.linkValue || '',
      placement: banner.placement || 'home_carousel',
      isActive: banner.isActive !== false,
    });
    setShowForm(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formData.image) {
      toast.error('Please upload a banner image');
      return;
    }
    try {
      if (editData?._id) {
        await b2cBannerService.update(editData._id, formData);
        toast.success('Banner updated');
      } else {
        await b2cBannerService.create(formData);
        toast.success('Banner created');
      }
      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner? It will disappear from the app immediately.')) return;
    try {
      await b2cBannerService.delete(id);
      toast.success('Banner deleted');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete banner');
    }
  };

  const toggleActive = async (banner) => {
    try {
      await b2cBannerService.update(banner._id, { isActive: !banner.isActive });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update banner');
    }
  };

  const moveBanner = async (list, index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const reordered = [...list];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setBanners((prev) => {
      const others = prev.filter((b) => b.placement !== placementFilter);
      return [...others, ...reordered];
    });
    try {
      await b2cBannerService.reorder(reordered.map((b, i) => ({ id: b._id, sortOrder: i })));
    } catch (error) {
      toast.error('Failed to save new order');
      loadData();
    }
  };

  const visibleBanners = banners
    .filter((b) => b.placement === placementFilter)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>App Banners / Carousel</h1>
          <p>
            <FiSmartphone style={{ verticalAlign: 'middle', marginRight: 6 }} />
            App-only — these do not appear on the website, only in the mobile app.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FiPlus /> Add Banner
        </button>
      </div>

      <div className="filters-bar">
        <select className="form-control" style={{ maxWidth: 220 }} value={placementFilter} onChange={(e) => setPlacementFilter(e.target.value)}>
          <option value="home_carousel">Home Carousel (big rotating banner)</option>
          <option value="promo_strip">Promo Strip (small banner grid)</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <Spinner text="Loading banners..." />
        ) : visibleBanners.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16 }}>
            {visibleBanners.map((banner, index) => (
              <div
                key={banner._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: 10,
                  opacity: banner.isActive ? 1 : 0.55,
                }}
              >
                <img src={banner.image} alt="" style={{ width: 110, height: 62, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{banner.title || <em>Untitled banner</em>}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{banner.subtitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Link: {banner.linkType === 'none' ? 'None' : `${banner.linkType} → ${banner.linkValue}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-secondary btn-icon btn-sm" onClick={() => moveBanner(visibleBanners, index, -1)} disabled={index === 0} title="Move up">
                    <FiArrowUp size={14} />
                  </button>
                  <button className="btn btn-secondary btn-icon btn-sm" onClick={() => moveBanner(visibleBanners, index, 1)} disabled={index === visibleBanners.length - 1} title="Move down">
                    <FiArrowDown size={14} />
                  </button>
                  <label className="switch" style={{ display: 'inline-flex', alignItems: 'center', margin: '0 6px' }}>
                    <input type="checkbox" checked={!!banner.isActive} onChange={() => toggleActive(banner)} />
                  </label>
                  <button className="btn btn-secondary btn-icon btn-sm" onClick={() => openEdit(banner)} title="Edit">
                    <FiEdit2 size={14} />
                  </button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(banner._id)} title="Delete">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><h3>No banners in this placement yet</h3></div>
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editData ? 'Edit Banner' : 'Add Banner'}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" form="banner-form" className="btn btn-primary">
              {editData ? 'Update Banner' : 'Create Banner'}
            </button>
          </>
        }
      >
        <form id="banner-form" onSubmit={handleSave}>
          <div className="form-group">
            <BannerImageUploader
              image={formData.image}
              onChange={(url, publicId) => setFormData((p) => ({ ...p, image: url, imagePublicId: publicId }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Title (optional)</label>
            <input className="form-control" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Subtitle (optional)</label>
            <input className="form-control" value={formData.subtitle} onChange={(e) => setFormData((p) => ({ ...p, subtitle: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Placement</label>
            <select className="form-control" value={formData.placement} onChange={(e) => setFormData((p) => ({ ...p, placement: e.target.value }))}>
              <option value="home_carousel">Home Carousel</option>
              <option value="promo_strip">Promo Strip</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tapping this banner opens</label>
            <select className="form-control" value={formData.linkType} onChange={(e) => setFormData((p) => ({ ...p, linkType: e.target.value }))}>
              {linkTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {formData.linkType !== 'none' && (
            <div className="form-group">
              <label className="form-label">Link value</label>
              <input
                className="form-control"
                placeholder={formData.linkType === 'url' ? 'https://...' : 'Paste the ID'}
                value={formData.linkValue}
                onChange={(e) => setFormData((p) => ({ ...p, linkValue: e.target.value }))}
              />
            </div>
          )}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="banner-active"
              checked={formData.isActive}
              onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
            />
            <label htmlFor="banner-active" className="form-label" style={{ margin: 0 }}>Active (visible in app)</label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default B2CBannersPage;
