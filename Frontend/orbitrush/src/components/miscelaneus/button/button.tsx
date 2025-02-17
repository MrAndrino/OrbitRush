import styles from '@/components/miscelaneus/button/button.module.css';
import Link from 'next/link';

type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  color: 'blue' | 'orange' | 'red' | 'disabled';
  href?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
};

function Button({ children, color, href, className, onClick, type }: ButtonProps) {
  const isDisabled = color === 'disabled';

  const buttonContent = (
    <button 
      onClick={isDisabled ? undefined : onClick} 
      type={type} 
      className={`${styles[color]} ${className}`}
      disabled={isDisabled}
    >
      {children}
    </button>
  );

  if (href && !isDisabled) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
}

export default Button;
