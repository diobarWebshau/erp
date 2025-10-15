import type { JSX } from "react";
import KPICard from "../../base/KPICard";
import StyleModule from "./KPICardCustomRed.module.css";
import withClassName from "../../../../../../utils/withClassName";

interface KPICardCustomRedProps {
    childrenSectionValue: React.ReactNode,
    childrenSectionText: React.ReactNode,
    icon: JSX.Element,
}

const KPICardCustomRed = ({
    childrenSectionValue,
    childrenSectionText,
    icon,
}: KPICardCustomRedProps) => {

    const iconWithClassname =
        withClassName(icon, StyleModule.icon);

    return (
        <KPICard
            childrenSectionValue={
                <div className={`nunito-bold ${StyleModule.containerValue}`}>
                    {childrenSectionValue}
                </div>
            }
            childrenSectionText={childrenSectionText}
            childrenIcon={
                <div className={StyleModule.containerIcon}>
                    {iconWithClassname}
                </div>
            }
            classNameContainer={StyleModule.container}
            classNameSectionValue={StyleModule.containerSectionValue}
            classNameSectionText={StyleModule.containerSectionText}
            classNameSectionIcon={StyleModule.containerSectionIcon}
        />
    )
}

export default KPICardCustomRed;