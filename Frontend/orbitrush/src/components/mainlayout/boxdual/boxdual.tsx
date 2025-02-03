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
  const { getUsers, userList, search, setSearchTerm, friendRequests } = useUsers();
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
    search();
  };

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

  return (
    <section className={styles.container} ref={containerRef}>
      {/* Panel lateral: se muestra/oculta según botón presionado */}
      <div
        className={`${styles.menu} ${activeMenu ? styles.menuVisible : ""} ${menuStyleClass}`}
      >
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
            <UserList users={userList} type="user" />
          </>
        )}
        {activeMenu === "notification" && (
          <div className={styles.notifContent}>
            {/* Botones para alternar entre notificaciones de partida y amistad */}
            <div className={styles.notifButtonsContainer}>
              <button
                onClick={() => setNotifType("game")}
                className={`${styles.notifButton} ${
                  notifType === "game" ? styles.activeNotif : ""
                }`}
              >
                Partida
              </button>
              <button
                onClick={() => setNotifType("friend")}
                className={`${styles.notifButton} ${
                  notifType === "friend" ? styles.activeNotif : ""
                }`}
              >
                Amistad
              </button>
            </div>
            {/* Renderizamos la lista de notificaciones según el tipo seleccionado */}
            <NotificationList
              notifications={
                notifType === "game"
                  ? dummyGameNotifications
                  : friendRequests
              }
              type={notifType}
              onAcceptGame={(id) => console.log("Aceptar game", id)}
              onRefuseGame={(id) => console.log("Rechazar game", id)}
              onAcceptFriend={(id) => console.log("Aceptar friend", id)}
              onRefuseFriend={(id) => console.log("Rechazar friend", id)}
            />
          </div>
        )}
      </div>

      {/* Contenedor de botones (notificaciones y usuarios) */}
      <div
        className={`${styles.buttonContainer} ${activeMenu ? styles.buttonsShifted : ""}`}
      >
        <button
          onClick={handleNotifClick}
          className={`${styles.buttonBlue} ${
            activeMenu === "notification" ? styles.activeBlue : ""
          }`}
        >
          <Bell />
        </button>
        <button
          onClick={handleUserClick}
          className={`${styles.buttonOrange} ${
            activeMenu === "user" ? styles.activeOrange : ""
          }`}
        >
          <UserPlus />
        </button>
      </div>
    </section>
  );
};

export default BoxDual;
