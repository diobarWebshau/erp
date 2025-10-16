import Icon from './../../assets/production_line_icon.svg?react';

interface IProps {
    className?: string;
}

const ProductionLineIcon = ({
    className = ""
}: IProps) => {
    return (
        <Icon className={className} />
    );
};

export default ProductionLineIcon;