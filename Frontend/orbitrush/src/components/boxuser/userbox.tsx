import { useState, useRef, useEffect } from 'react';
import styles from './userbox.module.css';
import UserList from '../cards/cardlist/userlist';
import { useUsers } from '@/context/userscontext';
import { UserPlus } from 'lucide-react';

const UserBox = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { userList } = useUsers();
  const { search, setSearchTerm } = useUsers();
  const [inputValue, setInputValue] = useState("");

  const boxRef = useRef<HTMLDivElement>(null);  
  const buttonRef = useRef<HTMLButtonElement>(null); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    search();
  };

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
        <div className={styles.searchBox}>
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder="Buscar usuarios..."
          />
        </div>
        <UserList users={userList} type="user" />
      </div>
    </section>
  );
};

export default UserBox;
