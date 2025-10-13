

import { memo } from "react";
import ObjectSelect from "./ObjectSelect";
import styles from "./ObjectSelectCustom.module.css";

interface IObjectSelectCustom<T> {
    options: T[],
    value: T | null,
    labelKey: keyof T,
    onChange: (value: T | null) => void,
    defaultLabel?: string,
    maxHeightToggle?: string,
    classNameInput?: string,
    classNameOption?: string,
}

const ObjectSelectCustom = <T,>({
    options,
    value,
    labelKey,
    onChange,
    defaultLabel,
    maxHeightToggle,
    classNameInput,
    classNameOption,
}: IObjectSelectCustom<T>) => {
    return (
        <ObjectSelect
            defaultLabel={defaultLabel || "Seleccione una opción"}
            labelKey={labelKey}
            options={options || []}
            value={value || null}
            onChange={onChange}
            {...(maxHeightToggle && {maxHeightToggle: maxHeightToggle})}
            classNameTrigger={`${classNameInput}  ${styles.trigger} nunito-semibold`}
            classNameToggle={styles.toggle}
            classNameOption={`${classNameOption} ${styles.option} nunito-semibold`}
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
