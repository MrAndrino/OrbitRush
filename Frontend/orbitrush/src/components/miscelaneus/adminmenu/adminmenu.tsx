"use client";

import { BASE_URL } from "@/config";
import { useUsers } from "@/context/userscontext";
import { useEffect, useState } from "react";
import Modal from "@/components/miscelaneus/modal/modal";
import Button from "../button/button";
import styles from "./adminmenu.module.css";

interface User {
    id: number;
    name: string;
    email?: string;
    image: string;
    role: string;
    isBanned: boolean;
}

const AdminMenu = () => {
    const { allUsers, getAllUsersList, changeUserRole, banUnbanUser } = useUsers();
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const openBanModal = (user: User) => {
        setSelectedUser(user);
        setIsBanModalOpen(true);
    };

    const closeBanModal = () => {
        setIsBanModalOpen(false);
        setSelectedUser(null);
    };

    useEffect(() => {
        getAllUsersList();
    }, []);

    return (
        <div>
            <h2 className={styles.title}>Gestión de Usuarios</h2>
            <div className={styles.userList}>
                {allUsers.length === 0 ? (
                    <p>No hay usuarios disponibles.</p>
                ) : (
                    allUsers.map((user: User) => (
                        <div key={user.id} className={styles.userCard}>

                            <img src={`${BASE_URL}/${user.image}`} alt={user.name} className={styles.userImage} />
                            <p className={styles.userName}>{user.name}</p>
                            <p className={styles.userEmail}>{user.email || "Sin email"}</p>
                            <p className={styles.userRole}>
                                Rol: <span>{user.role}</span>
                            </p>
                            <p className={user.isBanned ? styles.banned : styles.active}>
                                {user.isBanned ? "Baneado" : "Activo"}
                            </p>

                            <div className={styles.buttonContainer}>
                                <Button color={user.role === "admin" ? "blue" : "orange"}
                                    onClick={() => changeUserRole(user.id, user.role === "admin" ? "user" : "admin")}
                                    className="p-1">
                                    {user.role === "admin" ? "Degradar" : "Ascender"}
                                </Button>

                                <Button color={user.isBanned ? "orange" : "red"}
                                    onClick={() => openBanModal(user)}
                                    className="p-1">
                                    {user.isBanned ? "Desbanear" : "Banear"}
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isBanModalOpen && selectedUser && (
                <Modal isOpen={isBanModalOpen} closeModal={closeBanModal} color={selectedUser.isBanned ? "orange" : "red"} className="flex flexcol w-[40%] justify-center">
                    <div className="flex flex-col gap-12">
                        <p className="text-2xl">
                            ¿Seguro que quieres {selectedUser.isBanned ? "desbanear" : "banear"} a "{selectedUser.name}"?
                        </p>
                        <div className="flex justify-center gap-[5rem] select-none">
                            <Button color={selectedUser.isBanned ? "orange" : "red"}
                                onClick={() => {
                                    banUnbanUser(selectedUser.id); closeBanModal();
                                }}
                                className="w-[10rem] h-[4rem] text-2xl">
                                {selectedUser.isBanned ? "Desbanear" : "Banear"}
                            </Button>
                            <Button color="blue"
                                onClick={closeBanModal}
                                className="w-[10rem] h-[4rem] text-2xl">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default AdminMenu;
