import { useState } from "react";
import { useUsers } from "@/context/userscontext";
import styles from "./search.module.css";

export default function Search() {
  const { search, setSearchTerm } = useUsers();  
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchTerm(value); 
    search(); 
  };

  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Buscar amigos..."
      />
    </div>
  );
}
