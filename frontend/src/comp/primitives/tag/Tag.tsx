import styles from "./Tag.module.css";

interface ITagProps {
    label?: string;
    className?: string;
}

const Tag = ({ label, className }: ITagProps) => {
    return (
        <div className={`nunito-bold ${styles.tag} ${className}`}>
            {label}
        </div>
    );
};  

export default Tag;
