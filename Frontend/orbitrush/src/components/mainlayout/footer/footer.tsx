import { useWebSocket } from '@/context/websocketcontext';
import styles from './footer.module.css'
import Line from '@/components/miscelaneus/line/line';
import { useEffect } from 'react';

function Footer() {
  const { onlineCount } = useWebSocket();

  useEffect(() => {
    console.log("El número de usuarios conectados ha cambiado:", onlineCount);
  }, [onlineCount]);
  
  return (
    <footer>
      <div className='rotate-180'><Line /></div>
      <div className={styles.fcontainer}>
        <p>Usuarios conectados: {onlineCount}</p>
        <p>Usuarios jugando:</p>
        <p>Partidas en curso:</p>
      </div>
    </footer>
  )
}

export default Footer;