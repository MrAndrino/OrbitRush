import styles from '@/components/footer/footer.module.css'
import Line from '../line/line';

function Footer() {
  return (
    <footer>
      <div className='rotate-180'><Line /></div>
      <div className={styles.fcontainer}>
        <p>Usuarios conectados:</p>
        <p>Usuarios jugando:</p>
        <p>Partidas en curso:</p>
      </div>
    </footer>
  )
}

export default Footer;