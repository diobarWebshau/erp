import { useCallback } from "react";
import styles from "./Tag.module.css";

interface ITagProps {
    label?: string;
    className?: string;
    onClick?: () => void;
}

const Tag = ({ label, className, onClick }: ITagProps) => {

    const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        }
    }, [onClick]);

    return (
        <div
            className={`nunito-bold 
            ${styles.tag} ${className}`}
            {...(onClick ? { onClick: handleClick } : {})}
        >
            {label}
        </div>
    );
};

export default Tag;
