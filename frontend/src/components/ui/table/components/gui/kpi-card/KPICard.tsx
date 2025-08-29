
import StyleModule from "./KPICard.module.css";

interface KPICardProps {
    childrenSectionValue: React.ReactNode,
    childrenSectionText: React.ReactNode,
    childrenIcon: React.ReactNode,
    classNameContainer?: string,
}

const KPICard = ({
    childrenSectionValue,
    childrenSectionText,
    childrenIcon,
    classNameContainer,
}: KPICardProps) => {
    return (
        <div className={`${StyleModule.container} ${classNameContainer}`}>
            <section className={StyleModule.sectionValue}>
                {childrenSectionValue}
            </section>
            <section className={StyleModule.sectionText}>
                {childrenSectionText}
            </section>
            <section className={StyleModule.sectionIcon}>
                {childrenIcon}
            </section>  
        </div>
    )
}

export default KPICard
