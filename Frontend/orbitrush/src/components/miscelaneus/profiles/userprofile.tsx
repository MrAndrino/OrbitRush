import { useEffect, useState } from "react";
import { useUsers } from "@/context/userscontext";
import { useWebSocket } from "@/context/websocketcontext";
import { BASE_URL } from "@/config";
import { UserPlus, UserMinus } from "lucide-react";
import styles from "./profile.module.css";
import Button from "@/components/miscelaneus/button/button";
import toast from "react-hot-toast";
import Modal from "@/components/miscelaneus/modal/modal";

interface Match {
  id: number;
  matchDate: string;
  duration: string;
  result: number;
  opponentName: string;
}

interface UserProfileProps {
  id: number;
}

const UserProfile = ({ id }: UserProfileProps) => {
  const { userProfile, getUserProfileData, friendList } = useUsers();
  const { sendFriendRequest, deleteFriend } = useWebSocket();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    getUserProfileData(id);
  }, [id]);

  if (!userProfile) {
    return <div>No se pudieron cargar los datos de este perfil.</div>;
  }

  const profileImage = userProfile.image
    ? `${BASE_URL}/${userProfile.image}`
    : "/images/OrbitRush-TrashCan.jpg";

  const isFriend = friendList.some((friend: { id: number }) => friend.id === userProfile.id);

  const handleFriendButtonClick = () => {
    if (isFriend) {
      setIsConfirmModalOpen(true);
    } else {
      sendFriendRequest(userProfile.id);
      toast.success(`Enviaste solicitud de amistad a ${userProfile.name}.`);
    }
  };

  const handleRemoveFriend = () => {
    deleteFriend(userProfile.id);
    toast.success(`Eliminaste a ${userProfile.name} correctamente.`);
    setIsConfirmModalOpen(false);
  };

  const getResultInfo = (result: number) => {
    switch (result) {
      case 0:
        return { text: "Victoria", className: styles.resultWin };
      case 1:
        return { text: "Derrota", className: styles.resultLoss };
      case 2:
        return { text: "Empate", className: styles.resultDraw };
      default:
        return { text: "Resultado desconocido", className: "" };
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileData}>
        <img src={profileImage} alt="Imagen de perfil" className={styles.otherProfileImage} />
        <div>
          <p className={styles.profileName}>{userProfile.name}</p>
        </div>
        <Button
          color={isFriend ? "red" : "orange"}
          onClick={handleFriendButtonClick}
          className="p-2 flex items-center gap-2"
        >
          {isFriend ? (
            <>
              <UserMinus />
              Eliminar amigo
            </>
          ) : (
            <>
              <UserPlus />
              Agregar amigo
            </>
          )}
        </Button>
      </div>

      <div className={styles.matchesHistory}>
        <p className={styles.profileName}>Historial de partidas:</p>
        <ul className={styles.matchesList}>
          {userProfile.matches && userProfile.matches.length > 0 ? (
            userProfile.matches.map((match: Match, index: number) => {
              const resultInfo = getResultInfo(match.result);
              return (
                <li key={index} className={styles.matchItem}>
                  <div className={styles.matchItemPart}>
                    <p className={resultInfo.className}>{resultInfo.text}</p>
                    <p>vs {match.opponentName}</p>
                  </div>
                  <div className={styles.matchItemPart}>
                    <p>
                      Fecha: {(() => {
                        try {
                          const normalizedDate = match.matchDate.split(".")[0];
                          return new Date(normalizedDate).toLocaleDateString();
                        } catch (error) {
                          return "Fecha inválida";
                        }
                      })()}
                    </p>
                    <p>Duración: {match.duration}</p>
                  </div>
                </li>
              );
            })
          ) : (
            <p>No has jugado ningún partido aún.</p>
          )}
        </ul>
      </div>

      {/* Modal de confirmación para eliminar amigo */}
      <Modal
        isOpen={isConfirmModalOpen}
        closeModal={() => setIsConfirmModalOpen(false)}
        color="red"
        className="w-[40%]"
      >
        <div className="flex flex-col gap-12">
          <p className="text-2xl">
            ¿Seguro que quieres eliminar a "{userProfile.name}" de tu lista de amigos?
          </p>
          <div className="flex justify-center gap-[5rem] select-none">
            <Button color="red" onClick={handleRemoveFriend} className="w-[10rem] h-[4rem] text-2xl">
              Eliminar
            </Button>
            <Button color="blue" onClick={() => setIsConfirmModalOpen(false)} className="w-[10rem] h-[4rem] text-2xl">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;