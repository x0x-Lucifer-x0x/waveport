import React from 'react';
import { useNavigate } from 'react-router-dom';
import PlatformSelector from './PlatformSelector';

function SelectSource() {
  const navigate = useNavigate();

  const handleSelect = (platformId) => {
    // Save source selection to sessionStorage or Context here if you want
    sessionStorage.setItem('sourcePlatform', platformId);
    // Navigate to destination selection page
    navigate('/select-destination');
  };

  return (
    <PlatformSelector
      title="Select Source Platform"
      onSelect={handleSelect}
      showBack={false}
    />
  );
}

export default SelectSource;
