import {FC, ReactNode} from "react";
import styles from './Modal.module.css'
interface ModalProps {
  isOpen: boolean
  title: string
  children: ReactNode
  closeModal: () => void
}
export const Modal:FC<ModalProps> = ({isOpen, title, children, closeModal}) => {
  console.log(isOpen)
  if(!isOpen){
    return null
  }

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button type="button" id="closeFilterModal" className={styles.close} onClick={closeModal}>
          &times;
        </button>
        <h2 className={styles.title}>{title}</h2>

        {children}
      </div>
    </div>
  )
}