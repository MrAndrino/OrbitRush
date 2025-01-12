import styles from '@/components/button/button.module.css'

type ButtonProps = {
  children: React.ReactNode;
  color: 'blue' | 'red' | 'green';
};

function Button({ children, color }: ButtonProps) {
  return (
    <div className={styles[color]}>
      <button>{children}</button>
    </div>
  )
}

export default Button;