import React from 'react';

const PropertyDetail = ({ property }) => {
  return (
    <div>
      <h2>{property.title}</h2>
      <p>{property.description}</p>
      <p>Price: ${property.price}</p>
    </div>
  );
};

export default PropertyDetail;
