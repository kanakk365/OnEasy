import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PrivateLimitedDetails from '../../pages/PrivateLimitedDetails';
import ProprietorshipViewDetails from '../../pages/ProprietorshipViewDetails';

function RegistrationDetailsRouter() {
  const { ticketId } = useParams();

  // Determine which component to render based on ticket ID prefix
  if (ticketId.startsWith('PVT_')) {
    return <PrivateLimitedDetails />;
  } else if (ticketId.startsWith('PROP_')) {
    return <ProprietorshipViewDetails />;
  }

  // Default to Private Limited if no prefix match
  return <PrivateLimitedDetails />;
}

export default RegistrationDetailsRouter;

