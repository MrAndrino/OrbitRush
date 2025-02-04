import React, { useState } from "react";
import styles from "./friendcard.module.css";
import Modal from "../../modal/modal";
import Button from "../../button/button";
import { BASE_URL } from "@/config";
import toast from "react-hot-toast";
import { useWebSocket } from "@/context/websocketcontext";

export interface User {
  id: number;
  name: string;
  image: string;
  state: "Disconnected" | "Connected" | "Playing";
}

const stateColors: Record<User["state"], string> = {
  Disconnected: styles.stateDisconnected,
  Connected: styles.stateConnected,
  Playing: styles.statePlaying,
};

interface FriendCardProps {
  user: User;
  type: "user" | "friend";
  isExpanded: boolean;
  handleExpand: () => void;
}

const FriendCard = ({ user, type, isExpanded, handleExpand }: FriendCardProps) => {
  const { sendFriendRequest, deleteFriend } = useWebSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSendRequest = () => {
    sendFriendRequest(user.id);
    toast.success(`Enviaste solicitud de amistad a ${user.name}.`);
  };

  const handleRemoveFriend = () => {
    deleteFriend(user.id);
    toast.success(`Eliminaste a ${user.name} correctamente.`);
    closeModal();
  };

  return (
    <div className={`${styles.userCard} ${isExpanded ? styles.cardHovered : ""}`}>
      <div className={styles.userInfo} onClick={handleExpand}>
        <div className={styles.imageContainer}>
          <img src={`${BASE_URL}/${user.image}`} alt="" className={styles.userImage} />
          <div className={`${styles.stateIndicator} ${stateColors[user.state]}`}></div>
        </div>
        <span className={styles.userName}>{user.name}</span>
      </div>

      {isExpanded && (
        <div className={styles.extraButtons}>
          {type === "friend" ? (
            <>
              <button className={styles.extraButton}>Invitar</button>
              <button className={styles.extraButton}>Perfil</button>
              <button className={styles.extraButtonErase} onClick={openModal}>Borrar</button>
            </>
          ) : (
            <>
              <button className={styles.extraButton} onClick={handleSendRequest}>Agregar</button>
              <button className={styles.extraButton}>Perfil</button>
            </>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} closeModal={closeModal} color="red" className="w-[40%]">
        <div className="flex flex-col gap-12">
          <p className="text-2xl">
            Seguro que quieres eliminar a "{user.name}" de tu lista de amigos?
          </p>
          <div className="flex justify-center gap-[5rem] select-none">
            <Button color="red" onClick={handleRemoveFriend} className="w-[10rem] h-[4rem] text-2xl">Eliminar</Button>
            <Button color="blue" onClick={closeModal} className="w-[10rem] h-[4rem] text-2xl">Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FriendCard;
