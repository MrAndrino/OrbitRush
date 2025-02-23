import styles from './header.module.css'
import Line from '../../miscelaneus/line/line';
import MainCard from '../../miscelaneus/cards/maincard/maincard';

function Header() {
  return (
    <header>
      <div className={styles.hcontainer}>
        <MainCard />
        <img src="/images/OrbitRush-Title.png" alt="" className={styles.hlogo} />
      </div>
      <Line />
    </header>
  )
}

export default Header;