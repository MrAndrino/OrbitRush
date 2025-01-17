import styles from '@/components/line/line.module.css'

function Line () {
  return(
    <div className={styles.neonBorder}>
      <div className={styles.content}></div>
    </div>
  )
}

export default Line;