import { useState, useRef, useEffect } from 'react';
import styles from './dualDropdown.module.css';
import UserList from '../cards/cardlist/userlist';
import { useUsers } from '@/context/userscontext';
import { UserPlus, Bell } from 'lucide-react';

type MenuType = 'user' | 'notification' | null;

const DualDropdown = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Para el contenido de usuarios
  const { userList, search, setSearchTerm } = useUsers();
  const [inputValue, setInputValue] = useState("");

  // Manejar clic en el botón de usuarios (naranja)
  const handleUserClick = () => {
    setActiveMenu(activeMenu === 'user' ? null : 'user');
  };

  // Manejar clic en el botón de notificaciones (azul)
  const handleNotifClick = () => {
    setActiveMenu(activeMenu === 'notification' ? null : 'notification');
  };

  // Actualizar búsqueda de usuarios
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    search();
  };

  // Cerrar el menú al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Determinamos la clase para el borde y box-shadow del menú según el botón activo
  const menuStyleClass =
    activeMenu === 'user'
      ? styles.menuOrange
      : activeMenu === 'notification'
      ? styles.menuBlue
      : '';

  return (
    <section className={styles.container} ref={containerRef}>
      {/* Panel lateral: se muestra u oculta con estilos (borde y box-shadow) según el botón presionado */}
      <div
        className={`${styles.menu} ${activeMenu ? styles.menuVisible : ''} ${menuStyleClass}`}
      >
        {activeMenu === 'user' && (
          <>
            <div className={styles.searchBox}>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Buscar usuarios..."
              />
            </div>
            <UserList users={userList} type="user" />
          </>
        )}
        {activeMenu === 'notification' && (
          <div className={styles.notifContent}>
            <p>Aquí irían las notificaciones.</p>
          </div>
        )}
      </div>

      {/* Contenedor de botones (notificaciones primero, luego usuarios) */}
      <div className={`${styles.buttonContainer} ${activeMenu ? styles.buttonsShifted : ''}`}>
        <button
          onClick={handleNotifClick}
          className={`${styles.buttonBlue} ${activeMenu === 'notification' ? styles.active : ''}`}
        >
          <Bell />
        </button>
        <button
          onClick={handleUserClick}
          className={`${styles.buttonOrange} ${activeMenu === 'user' ? styles.active : ''}`}
        >
          <UserPlus />
        </button>
      </div>
    </section>
  );
};

export default DualDropdown;
