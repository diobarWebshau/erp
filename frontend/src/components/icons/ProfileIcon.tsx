import Icon from './../../assets/profile.svg?react';

interface IProps {
    className?: string;
}

const ProfileIcon = ({
    className = ""
}: IProps
) => {
    return (
        <Icon className={className} />
    );
};

export default ProfileIcon;