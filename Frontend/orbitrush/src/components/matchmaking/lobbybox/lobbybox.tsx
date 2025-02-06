import React, { useState } from "react";
import GameCard, { User } from "@/components/miscelaneus/cards/gamecard/gamecard";
import styles from "./lobbybox.module.css";
import Button from "@/components/miscelaneus/button/button";
import { BookOpen, LogOut } from "lucide-react";
import Modal from "@/components/miscelaneus/modal/modal";
import Instructions from "@/components/miscelaneus/instructions/instructions";

interface LobbyBoxProps {
  users: User[];
}

const LobbyBox = ({ users }: LobbyBoxProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    
  return (
    <div className={styles.lobbyBox}>
      <div className={styles.side}>
        <div className="flex gap-8 font-center">
          <Button color="blue" onClick={openModal} className="h-12 w-16 text-xl flex items-center justify-center"><BookOpen /></Button>
          <Button color="red" className="h-12 w-16 text-xl flex items-center justify-center"><LogOut /></Button>
        </div>
        <GameCard user={users[0]} color="blue" />
      </div>

      <img src='/images/vs2.png' alt="" className={styles.image} />

      <div className={styles.side}>
        <GameCard user={users[1]} color="orange" />
        <Button color="orange" className="h-12 w-44 text-xl">Empezar Partida</Button>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} closeModal={closeModal} color='blue' className='w-[55%]'>
        <Instructions/>
      </Modal>
      
    </div>
  );
};

export default LobbyBox;
