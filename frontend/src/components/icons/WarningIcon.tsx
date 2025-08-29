import Icon from "./../../assets/warningSymbol.svg?react";

interface IProps {
    className?: string;
}

const WarningIcon = ({
    className = ""
}: IProps) => {
    return (
        <Icon className={className} />
    );
}

export default WarningIcon;
