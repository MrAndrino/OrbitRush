import { useState, useRef, useEffect } from 'react';
import styles from './notificationbox.module.css';
import { UserPlus } from 'lucide-react';

const NotificationBox = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const boxRef = useRef<HTMLDivElement>(null);  
  const buttonRef = useRef<HTMLButtonElement>(null); 

  const toggleBox = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <section className={styles.ubcontainer}>
      <button
        ref={buttonRef}
        onClick={toggleBox}
        className={`${styles.button} ${isVisible ? styles.buttonOpen : ''}`}
      >
        <UserPlus />
      </button>

      <div
        ref={boxRef}
        className={`${styles.box} ${isVisible ? styles.boxVisible : ''}`}
      >
        asdf
      </div>
    </section>
  );
};

export default NotificationBox;
