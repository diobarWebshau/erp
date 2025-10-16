import Logo from '../../assets/Google.svg?react';

interface GoogleIconProps {
    classNameIcon?: string
}

const GoogleIcon = ({
    classNameIcon
}: GoogleIconProps) => {
    return (
        <Logo className={classNameIcon} />
    );
};

export default GoogleIcon;

