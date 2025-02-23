import { useEffect, useState } from "react";
import { useUsers } from "@/context/userscontext";
import { BASE_URL } from "@/config";
import { Pencil, PencilOff } from 'lucide-react';
import Button from "@/components/miscelaneus/button/button";
import styles from './profile.module.css';

interface Match {
  id: number;
  matchDate: string;
  duration: string;
  result: number;
  opponentName: string;
}

const SelfProfile = () => {
  const { selfProfile, getSelfProfileData } = useUsers();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: null as File | null
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    getSelfProfileData();
  }, []);

  useEffect(() => {
    if (selfProfile) {
      setFormData({
        name: selfProfile.name,
        email: selfProfile.email,
        password: "",
        image: null
      });

      setPreviewImage(selfProfile.image ? `${BASE_URL}/${selfProfile.image}` : "/images/OrbitRush-TrashCan.jpg");
    }
  }, [selfProfile]);

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  if (!selfProfile) {
    return <div>No se pudieron cargar los datos de tu perfil.</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newImage = e.target.files[0];
      setFormData(prevState => ({
        ...prevState,
        image: newImage
      }));

      const objectURL = URL.createObjectURL(newImage);
      setPreviewImage(objectURL);
    }
  };

  const handleSave = () => {
    console.log("Guardar cambios:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: selfProfile.name,
      email: selfProfile.email,
      password: "",
      image: null
    });

    setPreviewImage(selfProfile.image ? `${BASE_URL}/${selfProfile.image}` : "/images/OrbitRush-TrashCan.jpg");
    setIsEditing(false);
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileData}>
        {isEditing ? (
          <form className="space-y-4 py-4" noValidate>
            <section className="flex flex-col gap-2 pb-4">
              <div className="flex flex-col items-center pb-4">
                <label htmlFor="profileImage" className={styles.editProfileImage}>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Imagen de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">+</span>
                  )}
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
                  />
                </label>
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={10}
              />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <label htmlFor="password" className="pt-4">Nueva Contraseña:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </section>

            <div className="flex justify-center gap-2">
              <Button color="blue" type="button" onClick={handleSave} className="p-2 w-28 text-xl">
                Guardar
              </Button>
              <Button color="red" type="button" onClick={handleCancel} className="p-2" aria-label="Cancelar edición">
                <PencilOff />
              </Button>
            </div>
          </form>
        ) : (
          <>
            <img src={previewImage || "/images/OrbitRush-TrashCan.jpg"} alt="Imagen de perfil" className={styles.selfProfileImage} />
            <div className="pb-8">
              <p className={styles.profileName}>{selfProfile.name}</p>
              <p>{selfProfile.email}</p>
            </div>
            <Button color="blue" className="p-2 flex items-center gap-4" onClick={() => setIsEditing(true)}>
              <Pencil />Editar Perfil
            </Button>
          </>
        )}
      </div>

      <div className={styles.matchesHistory}>
        <p className={styles.profileName}>Historial de partidas:</p>
        <ul className={styles.matchesList}>
          {selfProfile.matches && selfProfile.matches.length > 0 ? (
            selfProfile.matches.map((match: Match) => (
              <li key={match.id} className={styles.matchItem}>
                <div className={styles.matchItemPart}>
                  <p>{match.result === 0 ? "Victoria" : match.result === 1 ? "Derrota" : "Empate"}</p>
                  <p>vs {match.opponentName}</p>
                </div>
                <div className={styles.matchItemPart}>
                  <p>Fecha: {new Date(match.matchDate.split(".")[0]).toLocaleDateString()}</p>
                  <p>Duración: {match.duration}</p>
                </div>
              </li>
            ))
          ) : (
            <p>No has jugado ningún partido aún.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SelfProfile;
