import React from 'react';

export enum ButtonVariant {
  DEFAULT = 'default',
  RESET = 'reset',
  PRIMARY = 'primary'
}
// Тип для компонента общего текстового ввода
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  isSubmit?: boolean
  variant?: ButtonVariant
}
import styles from "./Button.module.css"

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  isSubmit,
  variant = ButtonVariant.DEFAULT
}) => (
  <button type={isSubmit? 'submit':'button'} className={`${styles.btn} ${styles[variant]}`} onClick={onClick}>
    {children}
  </button>
);