import classes from '@/components/button/button.module.css'

type ButtonProps = {
  children: React.ReactNode;
  variant: string;
  color: string;
};

function Button ({ children, variant, color}: ButtonProps) {
  return(
    <button className={`${classes[variant]} ${classes[color]} `}>
      {children}
    </button>
  )
}

export default Button;