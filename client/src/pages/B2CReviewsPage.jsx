import React, { useEffect, useState } from 'react';
import { FiStar, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import { b2cReviewService } from '../services/b2cReviewService';

const B2CReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await b2cReviewService.getAll({ page: 1, limit: 200 });
      setReviews(Array.isArray(res.data?.reviews) ? res.data.reviews : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load reviews');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review? It will be removed from the website and app.')) return;
    try {
      await b2cReviewService.delete(id);
      toast.success('Review deleted');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Reviews</h1>
          <p>Customer product reviews from the website and the app. Use this to moderate spam or inappropriate reviews.</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <Spinner text="Loading reviews..." />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length ? reviews.map((r) => (
                  <tr key={r._id}>
                    <td>{r.productId?.productName || 'N/A'}</td>
                    <td>
                      <div>{r.userName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.userEmail}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar
                            key={i}
                            size={14}
                            color={i < r.rating ? '#f5a623' : '#d0d0d0'}
                            fill={i < r.rating ? '#f5a623' : 'none'}
                          />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment}</td>
                    <td>{r.createdAt ? format(new Date(r.createdAt), 'dd MMM yyyy') : 'N/A'}</td>
                    <td>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(r._id)} title="Delete review">
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state"><h3>No reviews found</h3></div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default B2CReviewsPage;
