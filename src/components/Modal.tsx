
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[90vh] overflow-hidden">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* 弹窗内容 */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {children}
        </div>
        
        {/* 弹窗底部 */}
        {footer && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
