import KPICard from "../base/KPICard";
import StyleModule from "./KPICardCustom.module.css";

interface KPICardCustomProps {
    childrenSectionValue: React.ReactNode,
    childrenSectionText: React.ReactNode,
    childrenIcon: React.ReactNode,
}

const KPICardCustom = ({
    childrenSectionValue,
    childrenSectionText,
    childrenIcon,
}: KPICardCustomProps) => {
    return (
        <KPICard
            childrenSectionValue={childrenSectionValue}
            childrenSectionText={childrenSectionText}
            childrenIcon={childrenIcon}
            classNameContainer={StyleModule.container}
            classNameSectionValue={StyleModule.containerSectionValue}
            classNameSectionText={StyleModule.containerSectionText}
            classNameSectionIcon={StyleModule.containerSectionIcon}
        />
    )
}

export default KPICardCustom;