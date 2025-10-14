import StyleModule from "./KPICard.module.css";

interface KPICardProps {
    childrenSectionValue: React.ReactNode,
    childrenSectionText: React.ReactNode,
    childrenIcon: React.ReactNode,
    classNameContainer?: string,
    classNameSectionValue?: string,
    classNameSectionText?: string,
    classNameSectionIcon?: string,
}

const KPICard = ({
    childrenSectionValue,
    childrenSectionText,
    childrenIcon,
    classNameContainer,
    classNameSectionValue,
    classNameSectionText,
    classNameSectionIcon,
}: KPICardProps) => {
    return (
        <div className={`${StyleModule.container} ${classNameContainer}`}>
            <div className={`${StyleModule.sectionValue} ${classNameSectionValue}`}>
                {childrenSectionValue}
            </div>
            <div className={`${StyleModule.sectionText} ${classNameSectionText}`}>
                {childrenSectionText}
            </div>
            <div className={`${StyleModule.sectionIcon} ${classNameSectionIcon}`}>
                {childrenIcon}
            </div>
        </div>
    )
}

export default KPICard;