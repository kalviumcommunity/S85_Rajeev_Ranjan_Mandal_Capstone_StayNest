import React from 'react';

const PropertyList = ({ properties }) => {
  return (
    <div>
      <h2>Available Properties</h2>
      <ul>
        {properties.map(property => (
          <li key={property.id}>{property.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default PropertyList;
