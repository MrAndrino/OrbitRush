import { useEffect } from "react";
import { useUsers } from "@/context/userscontext";
import { BASE_URL } from "@/config";
import styles from './profile.module.css';

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

const UserProfile = ({id}:UserProfileProps) => {
  const { userProfile, getUserProfileData } = useUsers();

  useEffect(() => {
    getUserProfileData(id);
  }, []);

  if (!userProfile) {
    return <div>No se pudieron cargar los datos de este perfil.</div>;
  }

  const profileImage = userProfile.image
    ? `${BASE_URL}/${userProfile.image}`
    : "/images/OrbitRush-TrashCan.jpg";

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
          <p>{userProfile.email}</p>
        </div>
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
                          const formattedDate = new Date(normalizedDate).toLocaleDateString();
                          return formattedDate;
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
    </div>
  );
};

export default UserProfile;
