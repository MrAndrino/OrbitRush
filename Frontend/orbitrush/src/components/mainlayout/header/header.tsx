import styles from './header.module.css'
import Button from '../../miscelaneus/button/button';
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
        <Button href={"/menu/matchmaking"} color="orange" className="h-12 w-32 text-2xl font-bold">
          ¡JUGAR!
        </Button>
        <MainCard/>
      </div>
      <Line />
    </header>
  )
}

export default Header;