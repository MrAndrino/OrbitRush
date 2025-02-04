import { useEffect } from "react";
import { useUsers } from "@/context/userscontext";
import Image from "next/image";
import { BASE_URL } from "@/config";

interface Match {
  opponentName: string;
  result: string;
  date: string;
}

const SelfProfile = () => {
  const { selfProfile, getSelfProfileData } = useUsers();

  useEffect(() => {
    getSelfProfileData();
  }, []);

  if (!selfProfile) {
    return <div>No se pudieron cargar los datos de tu perfil.</div>;
  }

  const profileImage = selfProfile.image
    ? `${BASE_URL}/${selfProfile.image}`
    : "/images/OrbitRush-TrashCan.jpg";

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-md w-full max-w-lg">
      <h2 className="text-2xl font-bold">{selfProfile.name}</h2>
      <div className="my-4">
        <Image
          src={profileImage}
          alt="Imagen de perfil"
          width={150}
          height={150}
          className="rounded-full"
        />
      </div>
      <p className="text-lg">
        <strong>Estado:</strong> {selfProfile.state}
      </p>

      <h3 className="mt-6 text-xl font-semibold">Partidos jugados:</h3>
      <ul className="mt-3">
        {selfProfile.matches && selfProfile.matches.length > 0 ? (
          selfProfile.matches.map((match: Match, index: number) => (
            <li key={index} className="p-2 border-b border-gray-600">
              <p>
                <strong>Oponente:</strong> {match.opponentName}
              </p>
              <p>
                <strong>Resultado:</strong> {match.result}
              </p>
              <p>
                <strong>Fecha:</strong> {new Date(match.date).toLocaleDateString()}
              </p>
            </li>
          ))
        ) : (
          <p>No has jugado ningún partido aún.</p>
        )}
      </ul>
    </div>
  );
};

export default SelfProfile;
