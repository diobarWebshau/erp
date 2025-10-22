import SingleProgressBarMantine from "../base/SingleProgressBarMantine";
import StyleModule from "./SingleProgressBarMantineCustom.module.css";
import clsx from "clsx";
interface PropsSingleProgressBarMantineCustom {
    value: number;
    total: number;
    containerClassName?: string;
}

const SingleProgressBarMantineCustom = ({
    value,
    total,
    containerClassName
}: PropsSingleProgressBarMantineCustom) => {

    return (
        <div className={clsx(StyleModule.containerProgressQtyProduction, containerClassName)}>
            <SingleProgressBarMantine
                value={value}
                total={total}
                classNameLabel={StyleModule.labelProgressBar}
                classNameRoot={StyleModule.rootProgressBar}
                classNameSection={StyleModule.sectionProgressBar}
            />
        </div>
    );
}


export default SingleProgressBarMantineCustom;
