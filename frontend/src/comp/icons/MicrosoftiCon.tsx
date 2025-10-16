import Logo from '../../assets/Microsoft.svg?react';

interface MicrosoftIconProps {
    classNameIcon?: string
}

const MicrosoftIcon = ({
    classNameIcon
}: MicrosoftIconProps) => {
    return (
        <Logo className={classNameIcon} />
    );
};

export default MicrosoftIcon;
