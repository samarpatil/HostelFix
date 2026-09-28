import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../api/profileApi';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    hostel: '',
    block: '',
    roomNumber: '',
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getProfile();
      if (response.success) {
        setProfile(response.data);
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          hostel: response.data.hostel || '',
          block: response.data.block || '',
          roomNumber: response.data.roomNumber || '',
        });
      } else {
        setError(response.message || 'Failed to fetch profile');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch profile';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (formData.name && formData.name.length > 100) {
      errors.name = 'Name must be at most 100 characters';
    }

    if (formData.phone) {
      if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Phone must be a 10-digit number';
      }
    }

    if (!formData.hostel || formData.hostel.trim().length === 0) {
      errors.hostel = 'Hostel is required';
    }

    if (formData.hostel && formData.hostel.length > 50) {
      errors.hostel = 'Hostel must be at most 50 characters';
    }

    if (!formData.block || formData.block.trim().length === 0) {
      errors.block = 'Block is required';
    }

    if (formData.block && formData.block.length > 50) {
      errors.block = 'Block must be at most 50 characters';
    }

    if (!formData.roomNumber || formData.roomNumber.trim().length === 0) {
      errors.roomNumber = 'Room number is required';
    }

    if (formData.roomNumber && formData.roomNumber.length > 20) {
      errors.roomNumber = 'Room number must be at most 20 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSaving(true);
      const response = await updateProfile(formData);
      if (response.success) {
        setProfile(response.data);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        hostel: profile.hostel || '',
        block: profile.block || '',
        roomNumber: profile.roomNumber || '',
      });
      setFormErrors({});
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-red-900 font-bold mb-2">Error Loading Profile</h2>
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={fetchProfile}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">No profile data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your profile information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Student Account</p>
                <h2 className="text-2xl font-bold text-gray-900 mt-1">{profile.name}</h2>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6">
            {isEditing ? (
              // Edit Form
              <form className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Scholar Number (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scholar Number</label>
                  <input
                    type="text"
                    value={profile.scholarNumber}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Scholar number cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit number"
                    disabled={isSaving}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>

                {/* Hostel */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hostel</label>
                  <input
                    type="text"
                    name="hostel"
                    value={formData.hostel}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                      formErrors.hostel ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.hostel && <p className="text-red-500 text-sm mt-1">{formErrors.hostel}</p>}
                </div>

                {/* Block */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Block</label>
                  <input
                    type="text"
                    name="block"
                    value={formData.block}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                      formErrors.block ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.block && <p className="text-red-500 text-sm mt-1">{formErrors.block}</p>}
                </div>

                {/* Room Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                      formErrors.roomNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.roomNumber && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.roomNumber}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // View Mode
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">Name</p>
                    <p className="text-lg text-gray-900 mt-1">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">Email</p>
                    <p className="text-lg text-gray-900 mt-1">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">Scholar Number</p>
                    <p className="text-lg text-gray-900 mt-1">{profile.scholarNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">Phone</p>
                    <p className="text-lg text-gray-900 mt-1">{profile.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">Hostel</p>
                    <p className="text-lg text-gray-900 mt-1">{profile.hostel}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">Block</p>
                    <p className="text-lg text-gray-900 mt-1">{profile.block}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase">Room Number</p>
                    <p className="text-lg text-gray-900 mt-1">{profile.roomNumber}</p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="pt-4 border-t border-gray-200 mt-6">
                  <p className="text-sm text-gray-500">
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
