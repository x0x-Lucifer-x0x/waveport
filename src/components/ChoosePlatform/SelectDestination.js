import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlatformSelector from './PlatformSelector';

function SelectDestination() {
  //const navigate = useNavigate();

  const handleSelect = (platformId) => {
    // Save destination selection to sessionStorage or Context here
    sessionStorage.setItem('destinationPlatform', platformId);
    // For now you can navigate to next step page or show a placeholder
    alert(`Transfer from ${sessionStorage.getItem('sourcePlatform')} to ${platformId}`);
  };

  return (
    <PlatformSelector
      title="Select Destination Platform"
      onSelect={handleSelect}
      showBack={true}
    />
  );
}

export default SelectDestination;
