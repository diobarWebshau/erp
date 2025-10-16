import Icon from "./../../assets/TransferIcon.svg?react";

interface IProps {
    className?: string;
}

const TransferIcon = ({
    className = ""
}: IProps) => {
    return (
        <Icon className={className} />
    );
}

export default TransferIcon;
