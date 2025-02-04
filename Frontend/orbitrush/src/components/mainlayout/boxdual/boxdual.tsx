import { useState, useRef, useEffect } from "react";
import styles from "./boxdual.module.css";
import UserList from "../../miscelaneus/cards/cardlists/userlist";
import NotificationList from "../../miscelaneus/cards/cardlists/notificationlist";
import { useUsers } from "@/context/userscontext";
import { Bell, UserPlus } from "lucide-react";

type MenuType = "user" | "notification" | null;

const BoxDual = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>(null);
  const [notifType, setNotifType] = useState<"game" | "friend">("game");
  const containerRef = useRef<HTMLDivElement>(null);
  const { searchTerm, getUsers, userList, searchResults, search, setSearchTerm, setIncludeFriends, friendRequests } = useUsers();
  const [inputValue, setInputValue] = useState("");

  const handleUserClick = () => {
    setActiveMenu(activeMenu === "user" ? null : "user");
    getUsers();
  };

  const handleNotifClick = () => {
    setActiveMenu(activeMenu === "notification" ? null : "notification");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value);
    setIncludeFriends(false);
  };

  useEffect(() => {
    search();
  }, [searchTerm]);

  const displayedUsers = inputValue.trim() === "" ? userList : searchResults;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const menuStyleClass =
    activeMenu === "user"
      ? styles.menuOrange
      : activeMenu === "notification"
        ? styles.menuBlue
        : "";

  // Arrays de notificaciones dummy para ejemplo:
  const dummyGameNotifications = [
    { id: 1, sender: "Usuario1" },
    { id: 2, sender: "Usuario2" },
  ];

  const showNotificationDot =
    dummyGameNotifications.length > 0 || friendRequests.length > 0;

  return (
    <section className={styles.container} ref={containerRef}>
      {/* Panel lateral: se muestra/oculta según botón presionado */}
      <div className={`${styles.menu} ${activeMenu ? styles.menuVisible : ""} ${menuStyleClass}`}>
        {activeMenu === "user" && (
          <>
            <div className={styles.searchBox}>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Buscar usuarios..."
              />
            </div>
            <UserList users={displayedUsers} type="user" />
          </>
        )}
        {activeMenu === "notification" && (
          <div className={styles.notifContent}>
            {/* Botones para alternar entre notificaciones de partida y amistad */}
            <div className={styles.notifButtonsContainer}>
              <button onClick={() => setNotifType("game")} className={`${styles.notifButton} ${notifType === "game" ? styles.activeNotif : ""}`}>
                Partida
              </button>
              <button onClick={() => setNotifType("friend")} className={`${styles.notifButton} ${notifType === "friend" ? styles.activeNotif : ""}`}>
                Amistad
              </button>
            </div>
            <NotificationList notifications={notifType === "game" ? dummyGameNotifications : friendRequests} type={notifType} />
          </div>
        )}
      </div>

      {/* Contenedor de botones (notificaciones y usuarios) */}
      <div className={`${styles.buttonContainer} ${activeMenu ? styles.buttonsShifted : ""}`}>
        <button onClick={handleNotifClick} className={`${styles.buttonBlue} ${activeMenu === "notification" ? styles.activeBlue : ""}`}>
          <Bell className={styles.icon} />
          {showNotificationDot && <span className={styles.notificationDot} />}
        </button>
        <button onClick={handleUserClick} className={`${styles.buttonOrange} ${activeMenu === "user" ? styles.activeOrange : ""}`}>
          <UserPlus className={styles.icon} />
        </button>
      </div>
    </section>
  );
};

export default BoxDual;