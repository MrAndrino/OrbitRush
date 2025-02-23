import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/authcontext";
import styles from "./maincard.module.css";
import { BASE_URL } from "@/config";
import Modal from "../../modal/modal";
import SelfProfile from "../../profiles/selfprofile";

const MainCard = () => {
  const { decodedToken, logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);


  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const openModal = () => {
    setIsModalOpen(true);
    setMenuVisible(false);
  }
  const closeModal = () => setIsModalOpen(false);

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

  return (
    <div className={styles.mainCard}>
      <div
        className={`${styles.userInfo} ${menuVisible ? styles.active : ""}`}
        onClick={handleOpenMenu}
      >
        <img src={imageUrl} alt="User" className={styles.userImage} />
        <span>{decodedToken?.name}</span>
      </div>

      {menuVisible && (
        <div ref={menuRef} className={styles.menu} style={{ top: position.y, left: position.x }}>
          <button onClick={openModal}>Ver mi perfil</button>
          <button onClick={logout}>Cerrar sesión</button>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal} color='blue'>
        <SelfProfile />
      </Modal>
    </div>
  );
};

export default MainCard;
