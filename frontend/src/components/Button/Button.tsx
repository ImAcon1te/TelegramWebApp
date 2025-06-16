import React from 'react';


// Тип для компонента общего текстового ввода
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  isSubmit?: boolean
}
import styles from "./Button.module.css"

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  isSubmit
}) => (
  <button type={isSubmit? 'submit':'button'} className={styles.btn} onClick={onClick}>
    {children}
  </button>
);