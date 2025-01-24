import styles from '@/components/header/header.module.css'
import Button from '../button/button';
import Line from '../line/line';
import Link from 'next/link';

function Header() {
  return (
    <section>
      <div className={styles.hcontainer}>
        <Link href="/menu">
          <img src="images/OrbitRush-Title.png" alt="" className={styles.hlogo} />
        </Link>
        <Button href={"/matchmaking"} color="blue" className="p-3 text-2xl">
          ¡JUGAR!
        </Button>
        <div>Tarjeta Usuario</div>
      </div>
      <Line />
    </section>
  )
}

export default Header;