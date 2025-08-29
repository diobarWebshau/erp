import Icon from "./../../assets/discount.svg?react";

interface IProps {
    className?: string;
}

const Discount = ({
    className = ""
}: IProps) => {
    return (
        <Icon className={className} />
    )
}

export default Discount;
