// Modal Provider - Future-ready for VIBox, polls, etc.

import { createContext, useContext, useState, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

// Extensible modal types
export type ModalType = 'none'; // | 'vibox' | 'poll' | 'challenge' (future)

interface ModalContextValue {
  activeModal: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  modalData?: unknown;
  setModalData: (data: unknown) => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: PropsWithChildren) {
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [modalData, setModalData] = useState<unknown>(undefined);

  const value = useMemo(
    () => ({
      activeModal,
      openModal: (type: ModalType) => setActiveModal(type),
      closeModal: () => {
        setActiveModal('none');
        setModalData(undefined);
      },
      modalData,
      setModalData,
    }),
    [activeModal, modalData]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      
      {/* Future modals will be rendered here */}
      {/* Example:
      {activeModal === 'vibox' && <ViboxModal onClose={value.closeModal} />}
      {activeModal === 'poll' && <PollModal onClose={value.closeModal} />}
      */}
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}
