import React from 'react';

function PropertyModal({ property }) {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close">&times;</span>
        <h2>{property.name}</h2>
        <p>{property.price}</p>
        {/* more */}
      </div>
    </div>
  );
}

export default PropertyModal;
