import React from 'react';
import { useParams } from 'react-router-dom';
import PrivateLimitedDetails from '../../pages/PrivateLimitedDetails';
import ProprietorshipViewDetails from '../../pages/ProprietorshipViewDetails';
import StartupIndiaViewDetails from '../../pages/StartupIndiaViewDetails';

function RegistrationDetailsRouter() {
  const { ticketId } = useParams();

  // Determine which component to render based on ticket ID prefix
  if (ticketId.startsWith('PVT_')) {
    return <PrivateLimitedDetails />;
  } else if (ticketId.startsWith('PROP_')) {
    return <ProprietorshipViewDetails />;
  } else if (ticketId.startsWith('SI_')) {
    return <StartupIndiaViewDetails />;
  }

  // Default to Private Limited if no prefix match
  return <PrivateLimitedDetails />;
}

export default RegistrationDetailsRouter;


import PrivateLimitedDetails from '../../pages/PrivateLimitedDetails';
import ProprietorshipViewDetails from '../../pages/ProprietorshipViewDetails';
import StartupIndiaViewDetails from '../../pages/StartupIndiaViewDetails';

function RegistrationDetailsRouter() {
  const { ticketId } = useParams();

  // Determine which component to render based on ticket ID prefix
  if (ticketId.startsWith('PVT_')) {
    return <PrivateLimitedDetails />;
  } else if (ticketId.startsWith('PROP_')) {
    return <ProprietorshipViewDetails />;
  } else if (ticketId.startsWith('SI_')) {
    return <StartupIndiaViewDetails />;
  }

  // Default to Private Limited if no prefix match
  return <PrivateLimitedDetails />;
}

export default RegistrationDetailsRouter;

