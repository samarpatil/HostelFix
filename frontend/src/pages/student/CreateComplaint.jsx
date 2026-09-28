import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createComplaint } from '../api/complaintApi';

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Carpentry',
  'LAN/Internet',
  'Cleaning',
  'Civil/Building',
  'Furniture',
  'Appliance',
  'Security',
  'Other',
];

const PLACES = [
  'Room',
  'Bathroom/Toilet',
  'Corridor',
  'Common Area',
  'Mess',
  'Staircase',
  'Hostel Entrance',
  'Other',
];

const WORKER_TYPES = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'LAN/Network Technician',
  'Mason',
  'Cleaner',
  'AC/Appliance Technician',
  'Security',
  'Other',
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Emergency'];

export default function CreateComplaint() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    categoryOther: '',
    placeOfIssue: '',
    placeOfIssueOther: '',
    workerRequired: '',
    priority: 'Medium',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'Image must be smaller than 5MB',
        }));
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: 'Only JPG and PNG images are allowed',
        }));
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setErrors((prev) => ({
        ...prev,
        image: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    if (formData.title && formData.title.length > 100) {
      newErrors.title = 'Title must be at most 100 characters';
    }

    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be at most 1000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.category === 'Other' && !formData.categoryOther.trim()) {
      newErrors.categoryOther = 'Please specify the category';
    }

    if (!formData.placeOfIssue) {
      newErrors.placeOfIssue = 'Place of issue is required';
    }

    if (formData.placeOfIssue === 'Other' && !formData.placeOfIssueOther.trim()) {
      newErrors.placeOfIssueOther = 'Please specify the location';
    }

    if (!formData.workerRequired) {
      newErrors.workerRequired = 'Worker type is required';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createComplaint(formData, imageFile);

      if (response.success) {
        toast.success('Complaint created successfully!');
        navigate('/student/complaints');
      } else {
        toast.error(response.message || 'Failed to create complaint');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to create complaint';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-600 mt-2">Describe the problem you're experiencing in your hostel</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Brief summary of the issue"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              <p className="text-xs text-gray-500 mt-1">5-100 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="Provide detailed information about the issue..."
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-xs text-gray-500 mt-1">10-1000 characters</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Category Other */}
            {formData.category === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specify Category *
                </label>
                <input
                  type="text"
                  name="categoryOther"
                  value={formData.categoryOther}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Please specify..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                    errors.categoryOther ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.categoryOther && (
                  <p className="text-red-500 text-sm mt-1">{errors.categoryOther}</p>
                )}
              </div>
            )}

            {/* Place of Issue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place of Issue *
              </label>
              <select
                name="placeOfIssue"
                value={formData.placeOfIssue}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                  errors.placeOfIssue ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select location</option>
                {PLACES.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
              {errors.placeOfIssue && (
                <p className="text-red-500 text-sm mt-1">{errors.placeOfIssue}</p>
              )}
            </div>

            {/* Place of Issue Other */}
            {formData.placeOfIssue === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specify Location *
                </label>
                <input
                  type="text"
                  name="placeOfIssueOther"
                  value={formData.placeOfIssueOther}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  placeholder="Please specify..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                    errors.placeOfIssueOther ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.placeOfIssueOther && (
                  <p className="text-red-500 text-sm mt-1">{errors.placeOfIssueOther}</p>
                )}
              </div>
            )}

            {/* Worker Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worker Type Required *
              </label>
              <select
                name="workerRequired"
                value={formData.workerRequired}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                  errors.workerRequired ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select worker type</option>
                {WORKER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.workerRequired && (
                <p className="text-red-500 text-sm mt-1">{errors.workerRequired}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition ${
                  errors.priority ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Emergency (2h) • High (6h) • Medium (24h) • Low (72h)
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attach Photo (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      disabled={isSubmitting}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                      className="hidden"
                      id="image-input"
                    />
                    <label
                      htmlFor="image-input"
                      className="cursor-pointer block"
                    >
                      <p className="text-gray-600">Drag image here or click to select</p>
                      <p className="text-xs text-gray-500 mt-1">JPG or PNG, max 5MB</p>
                    </label>
                  </div>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/student/complaints')}
                disabled={isSubmitting}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
