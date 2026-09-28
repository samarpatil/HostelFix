import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getComplaintDetail, cancelComplaint } from '../api/complaintApi';

const STATUS_COLORS = {
  SUBMITTED: 'bg-blue-100 text-blue-800 border-blue-300',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ASSIGNED: 'bg-purple-100 text-purple-800 border-purple-300',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  RESOLVED: 'bg-green-100 text-green-800 border-green-300',
  CLOSED: 'bg-gray-100 text-gray-800 border-gray-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
  REOPENED: 'bg-orange-100 text-orange-800 border-orange-300',
};

const STATUS_ICONS = {
  SUBMITTED: '📝',
  UNDER_REVIEW: '👀',
  ASSIGNED: '👷',
  IN_PROGRESS: '🔧',
  RESOLVED: '✅',
  CLOSED: '🔒',
  REJECTED: '❌',
  REOPENED: '🔄',
};

export default function ComplaintDetails() {
  const { complaintId } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const fetchComplaint = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getComplaintDetail(complaintId);

      if (response.success) {
        setComplaint(response.data);
      } else {
        setError(response.message || 'Failed to fetch complaint');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch complaint';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      const response = await cancelComplaint(complaintId);

      if (response.success) {
        toast.success('Complaint cancelled successfully');
        await fetchComplaint();
        setShowCancelConfirm(false);
      } else {
        toast.error(response.message || 'Failed to cancel complaint');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to cancel complaint';
      toast.error(message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-900 font-bold mb-2">Error Loading Complaint</h2>
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => navigate('/student/complaints')}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
            >
              Back to Complaints
            </button>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = ['SUBMITTED', 'UNDER_REVIEW'].includes(complaint.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/student/complaints')}
            className="text-brand-600 hover:text-brand-700 font-medium transition"
          >
            ← Back to Complaints
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow mb-6">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Complaint ID</p>
                <h1 className="text-3xl font-bold text-gray-900 mt-1">{complaint.complaintId}</h1>
                <p className="text-xl text-gray-700 mt-4">{complaint.title}</p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold border ${
                    STATUS_COLORS[complaint.status]
                  }`}
                >
                  {STATUS_ICONS[complaint.status]} {complaint.status}
                </span>
              </div>
            </div>
          </div>

          {/* Complaint Details Grid */}
          <div className="p-8 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Description */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Description</h3>
                <p className="text-gray-900 leading-relaxed">{complaint.description}</p>
              </div>

              {/* Category */}
              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase">Category</p>
                <p className="text-lg text-gray-900 mt-1">
                  {complaint.category}
                  {complaint.categoryOther && ` - ${complaint.categoryOther}`}
                </p>
              </div>

              {/* Place of Issue */}
              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase">Place of Issue</p>
                <p className="text-lg text-gray-900 mt-1">
                  {complaint.placeOfIssue}
                  {complaint.placeOfIssueOther && ` - ${complaint.placeOfIssueOther}`}
                </p>
              </div>

              {/* Priority */}
              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase">Priority</p>
                <p className="text-lg text-gray-900 mt-1 font-semibold">
                  {complaint.priority === 'Emergency' && '🚨'}
                  {complaint.priority === 'High' && '⚠️'}
                  {complaint.priority === 'Medium' && '⏳'}
                  {complaint.priority === 'Low' && '✓'} {complaint.priority}
                </p>
              </div>

              {/* Worker Required */}
              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase">Worker Type</p>
                <p className="text-lg text-gray-900 mt-1">{complaint.workerRequired}</p>
              </div>

              {/* Location Info */}
              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase">Room Info</p>
                <p className="text-gray-900 mt-1">
                  {complaint.hostel}, {complaint.block}, Room {complaint.roomNumber}
                </p>
              </div>

              {/* Scholar Number */}
              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase">Scholar Number</p>
                <p className="text-gray-900 mt-1 font-mono">{complaint.scholarNumber}</p>
              </div>

              {/* SLA Deadline */}
              <div>
                <p className="text-sm font-semibold text-gray-700 uppercase">SLA Deadline</p>
                <p className="text-gray-900 mt-1">
                  {new Date(complaint.slaDeadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Assigned Worker */}
              {complaint.assignedWorker && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 uppercase">Assigned Worker</p>
                  <p className="text-gray-900 mt-1">
                    {complaint.assignedWorker.name}
                    <span className="text-gray-500 text-sm ml-1">
                      ({complaint.assignedWorker.workerType})
                    </span>
                  </p>
                  {complaint.assignedWorker.phone && (
                    <p className="text-gray-600 text-sm">{complaint.assignedWorker.phone}</p>
                  )}
                </div>
              )}

              {/* Admin Remark */}
              {complaint.adminRemark && (
                <div className="md:col-span-2 bg-blue-50 p-4 rounded border border-blue-200">
                  <p className="text-sm font-semibold text-gray-700 uppercase mb-2">Admin Remark</p>
                  <p className="text-gray-900">{complaint.adminRemark}</p>
                </div>
              )}
            </div>
          </div>

          {/* Images Section */}
          {complaint.images && complaint.images.length > 0 && (
            <div className="p-8 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Attached Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {complaint.images.map((image, idx) => (
                  <a
                    key={idx}
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg overflow-hidden hover:opacity-80 transition"
                  >
                    <img
                      src={image}
                      alt={`Complaint image ${idx + 1}`}
                      className="w-full h-40 object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="p-8 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold">Submitted</p>
                <p>{new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
              {complaint.resolvedAt && (
                <div>
                  <p className="font-semibold">Resolved</p>
                  <p>{new Date(complaint.resolvedAt).toLocaleDateString()}</p>
                </div>
              )}
              {complaint.closedAt && (
                <div>
                  <p className="font-semibold">Closed</p>
                  <p>{new Date(complaint.closedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        {complaint.history && complaint.history.length > 0 && (
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Status Timeline</h3>

            <div className="relative">
              {complaint.history.map((entry, idx) => (
                <div key={idx} className="mb-8 last:mb-0 flex gap-4">
                  {/* Timeline marker */}
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-brand-600 rounded-full mt-2"></div>
                    {idx < complaint.history.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 my-1"></div>
                    )}
                  </div>

                  {/* Timeline content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">
                          {entry.action}
                        </p>
                        <p className="text-sm text-gray-600">
                          {entry.performedBy ? `by ${entry.performedBy}` : 'by System'}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>

                    {/* Status change */}
                    {entry.fromStatus && entry.toStatus && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                          {entry.fromStatus}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                          {entry.toStatus}
                        </span>
                      </div>
                    )}

                    {/* Note */}
                    {entry.note && (
                      <p className="text-sm text-gray-700 mt-2 italic">"{entry.note}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <div className="mt-6">
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Cancel This Complaint
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-900 font-semibold mb-4">
                  Are you sure you want to cancel this complaint?
                </p>
                <p className="text-red-800 text-sm mb-6">
                  Once cancelled, you won't be able to reopen it. The admin can still view the history.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, Cancel It'}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isCancelling}
                    className="bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-medium py-2 px-6 rounded-lg transition"
                  >
                    No, Keep It
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
