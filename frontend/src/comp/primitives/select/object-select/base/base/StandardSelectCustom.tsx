

import { memo } from "react";
import StandardSelect from "./StandardSelect";
import styles from "./StandardSelectCustom.module.css";

interface IObjectSelectCustom{
    options: string[],
    value: string | null,
    onChange: (value: string | null) => void,
    defaultLabel?: string,
    maxHeightToggle?: string,
}

const ObjectSelectCustom = ({
    options,
    value,
    onChange,
    defaultLabel,
    maxHeightToggle,
}: IObjectSelectCustom) => {
    return (
        <StandardSelect
            defaultLabel={defaultLabel || "Seleccione una opción"}
            options={options || []}
            value={value || null}
            onChange={onChange}
            {...(maxHeightToggle && {maxHeightToggle: maxHeightToggle})}
            classNameTrigger={`${styles.trigger} nunito-semibold`}
            classNameToggle={styles.toggle}
            classNameOption={`${styles.option} nunito-semibold`}
            classNameIcon={styles.icon}
            classNameOptionSelected={styles.optionSelected}
            classNamePopoverFloating={styles.popoverFloating}
            classNameTriggerInvalid = {styles.triggerInvalid}
            classNameTriggerValidate = {styles.triggerValidate}
        />
    )
}

const ObjectSelectCustomMemo = memo(ObjectSelectCustom) as typeof ObjectSelectCustom;

export default ObjectSelectCustomMemo;
