import React from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "নিশ্চিত করুন",
  message,
  confirmText = "হ্যাঁ",
  cancelText = "না"
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
          {cancelText}
        </button>
        <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition">
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
