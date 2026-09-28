import axiosInstance from './axiosInstance';

// Create a new complaint
export const createComplaint = async (complaintData, imageFile) => {
  const formData = new FormData();
  
  // Add complaint fields
  formData.append('title', complaintData.title);
  formData.append('description', complaintData.description);
  formData.append('category', complaintData.category);
  if (complaintData.categoryOther) {
    formData.append('categoryOther', complaintData.categoryOther);
  }
  formData.append('placeOfIssue', complaintData.placeOfIssue);
  if (complaintData.placeOfIssueOther) {
    formData.append('placeOfIssueOther', complaintData.placeOfIssueOther);
  }
  formData.append('workerRequired', complaintData.workerRequired);
  formData.append('priority', complaintData.priority);
  
  // Add image if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }
  
  const response = await axiosInstance.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get student's complaints
export const getMyComplaints = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.status) queryParams.append('status', params.status);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.category) queryParams.append('category', params.category);
  
  const response = await axiosInstance.get(
    `/complaints/my${queryParams.toString() ? '?' + queryParams.toString() : ''}`
  );
  return response.data;
};

// Get complaint details
export const getComplaintDetail = async (complaintId) => {
  const response = await axiosInstance.get(`/complaints/${complaintId}`);
  return response.data;
};

// Cancel a complaint
export const cancelComplaint = async (complaintId) => {
  const response = await axiosInstance.patch(`/complaints/${complaintId}/cancel`);
  return response.data;
};
