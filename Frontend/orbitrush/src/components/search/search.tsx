import styles from "./search.module.css";

export default function Search(){

  return (
    <div className={styles.searchBox}>
      <input
        type="text"
        placeholder="Buscar amigos..."
      />
    </div>
  );
};