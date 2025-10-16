import Icon from './../../assets/shipping_icon.svg?react';

interface IProps {
    className?: string;
}

const ShippingIcon = ({
    className = ""
}: IProps
) => {
    return (
        <Icon className={className} />
    );
};

export default ShippingIcon;