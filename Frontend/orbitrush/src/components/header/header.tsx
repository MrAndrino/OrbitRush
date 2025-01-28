import styles from '@/components/header/header.module.css'
import Button from '../button/button';
import Line from '../line/line';
import Link from 'next/link';
import MainCard from '../cards/maincard';

function Header() {
  return (
    <header>
      <div className={styles.hcontainer}>
        <Link href="/menu">
          <img src="images/OrbitRush-Title.png" alt="" className={styles.hlogo} />
        </Link>
        <Button href={"/matchmaking"} color="orange" className="h-12 w-32 text-2xl font-bold">
          ¡JUGAR!
        </Button>
        <MainCard/>
      </div>
      <Line />
    </header>
  )
}

export default Header;