import styles from './header.module.css'
import Line from '../../miscelaneus/line/line';
import Link from 'next/link';
import MainCard from '../../miscelaneus/cards/maincard/maincard';

function Header() {
  return (
    <header>
      <div className={styles.hcontainer}>
        <Link href="/menu">
          <img src="/images/OrbitRush-Title.png" alt="" className={styles.hlogo} />
        </Link>
        <MainCard/>
      </div>
      <Line />
    </header>
  )
}

export default Header;