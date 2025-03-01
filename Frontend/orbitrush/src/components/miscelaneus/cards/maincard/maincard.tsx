import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/authcontext";
import styles from "./maincard.module.css";
import { BASE_URL } from "@/config";
import Modal from "../../modal/modal";
import SelfProfile from "../../profiles/selfprofile";
import AdminMenu from "../../adminmenu/adminmenu";

const MainCard = () => {
  const { decodedToken, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);


  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsAdminModalOpen(false);
    setMenuVisible(false);
  };

  const openAdminModal = () => {
    setIsAdminModalOpen(true);
    setIsProfileModalOpen(false);
    setMenuVisible(false);
  };

  const closeModals = () => {
    setIsProfileModalOpen(false);
    setIsAdminModalOpen(false);
  };

  const handleOpenMenu = (event: React.MouseEvent) => {
    setPosition({ x: event.clientX - 20, y: event.clientY + 20 });
    setMenuVisible(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }
    };

    if (menuVisible) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuVisible]);

  const imageUrl = decodedToken?.image ? `${BASE_URL}/${decodedToken.image}` : "/images/OrbitRush-TrashCan.jpg";
  const isAdmin = decodedToken?.role === "admin";

  return (
    <div className={styles.mainCard}>
      <div
        className={`${styles.userInfo} ${menuVisible ? styles.active : ""}`}
        onClick={handleOpenMenu}
      >
        <img src={imageUrl} alt="User" className={styles.userImage} />
        <span>{decodedToken?.name} {isAdmin && <span className="text-base text-yellow-500">(Admin)</span>}</span>
      </div>

      {menuVisible && (
        <div ref={menuRef} className={styles.menu} style={{ top: position.y, left: position.x }}>
          <button onClick={openProfileModal}>Ver mi perfil</button>
          {isAdmin && <button onClick={openAdminModal}>Administración</button>}
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      )}

      {/* Modales */}
      <Modal isOpen={isProfileModalOpen} closeModal={closeModals} color='blue' className="w-[45%]">
        <SelfProfile />
      </Modal>

      <Modal isOpen={isAdminModalOpen} closeModal={closeModals} color='blue'>
        <AdminMenu />
      </Modal>
    </div>
  );
};

export default MainCard;
