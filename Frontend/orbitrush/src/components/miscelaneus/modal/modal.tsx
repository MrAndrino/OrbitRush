import { useEffect } from 'react';
import styles from './modal.module.css';

interface ModalProps {
  isOpen: boolean;
  closeModal: () => void;
  children: React.ReactNode;
  color: 'blue' | 'orange' | 'red';
  className?: string;
}

const Modal = ({ isOpen, closeModal, children, color, className }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains(styles['modal-overlay'])) {
        closeModal();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeModal]);

  if (!isOpen) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={`${styles[color]} ${className}`}>
        <button onClick={closeModal} className={`${styles['close-button']} ${styles[`close-${color}`]}`}>
          &times;
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
