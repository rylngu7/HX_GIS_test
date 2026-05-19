
import React, { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';
import Toolbox from '../components/Toolbox';
import RemoteSensingModal from '../components/RemoteSensingModal';

export default function Home() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleOpenModal = (title: string) => {
    setActiveModal(title);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative">
          <MapView />
          <Toolbox onOpenModal={handleOpenModal} />
        </div>
      </div>

      {activeModal && (
        <RemoteSensingModal 
          isOpen={!!activeModal} 
          onClose={handleCloseModal} 
          title={activeModal} 
        />
      )}
    </div>
  );
}
