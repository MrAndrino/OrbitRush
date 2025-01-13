import styles from '@/components/button/button.module.css'
import Link from 'next/link';

type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  color: 'blue' | 'orange';
  href?: string;
  className?: string;
};

function Button({ children, color, href, className, onClick}: ButtonProps) {
  const buttonContent = (
    <button onClick={onClick} className={`${styles[color]} ${className}`}>
      {children}
    </button>
  )

  if (href) {
    return <Link href={href} >{buttonContent}</Link>;
  }

  return buttonContent;
}

export default Button;