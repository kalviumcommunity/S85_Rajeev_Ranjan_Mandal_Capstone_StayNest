import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProperties();
  }, [currentPage, statusFilter]);

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/properties?${params}`);
      setProperties(response.data.data.properties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveProperty = async (propertyId, approved, rejectionReason = '') => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/admin/properties/${propertyId}/approve`, { 
        approved, 
        rejectionReason 
      });
      fetchProperties(); // Refresh the list
      alert(`Property ${approved ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error approving property:', error);
      alert('Error processing property approval');
    }
  };

  const deleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/admin/properties/${propertyId}`);
        fetchProperties(); // Refresh the list
        alert('Property deleted successfully!');
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Error deleting property');
      }
    }
  };

  const handleReject = (propertyId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      approveProperty(propertyId, false, reason);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProperties();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Property Management</h3>
        <div className="flex space-x-4">
          {/* Search */}
          <div className="flex">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-l px-3 py-2 text-sm"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-4 py-2 rounded-r text-sm hover:bg-blue-600"
            >
              Search
            </button>
          </div>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="all">All Properties</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {properties.map((property) => (
          <div key={property._id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start space-x-4">
                  {/* Property Image */}
                  <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0].url || property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Property Details */}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{property.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{property.description?.substring(0, 100)}...</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-500">
                        📍 {property.location?.address}, {property.location?.city}
                      </p>
                      <p className="text-sm text-gray-500">
                        🏠 {property.propertyType} • {property.bedrooms} bed • {property.bathrooms} bath • {property.maxGuests} guests
                      </p>
                      <p className="text-sm text-gray-500">
                        👤 Host: {property.host?.name} ({property.host?.email})
                      </p>
                      <p className="text-lg font-bold text-green-600">${property.price}/night</p>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      property.isApproved === true ? 'bg-green-100 text-green-800' :
                      property.isApproved === false ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {property.isApproved === true ? '✅ Approved' :
                       property.isApproved === false ? '❌ Rejected' :
                       '⏳ Pending Approval'}
                    </span>
                    
                    {property.rejectionReason && (
                      <span className="text-sm text-red-600">
                        Reason: {property.rejectionReason}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {property.isApproved !== true && (
                      <button
                        onClick={() => approveProperty(property._id, true)}
                        className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        ✅ Approve
                      </button>
                    )}
                    
                    {property.isApproved !== false && (
                      <button
                        onClick={() => handleReject(property._id)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded text-sm hover:bg-yellow-600 transition-colors"
                      >
                        ❌ Reject
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteProperty(property._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🏠</div>
          <p>No properties found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50 hover:bg-gray-400 transition-colors"
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded">
          Page {currentPage}
        </span>
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default PropertyManagement;
