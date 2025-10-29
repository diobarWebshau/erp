import { Switch } from "@mantine/core";
import type { SwitchProps } from "@mantine/core";
import type { ChangeEvent, ReactNode } from "react";


interface ISwitchMantineProps {
    value: boolean,
    onChange: (value: boolean) => void,
    size?: "xs" | "sm" | "md" | "lg" | "xl",
    label?: string,
    labelOff?: string,
    labelOn?: string,
    labelPosition?: "left" | "right",
    iconActive?: ReactNode,
    iconInactive?: ReactNode,
    color: string
    classNames?: SwitchProps["classNames"]
}

const SwitchMantine = ({
    value,
    onChange,
    size = "md",
    label,
    labelPosition = "left",
    labelOff,
    labelOn,
    iconActive,
    iconInactive,
    color,
    classNames
}: ISwitchMantineProps) => {

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked)
    }

    return <div>
        <Switch
            checked={value}
            onChange={handleChange}
            color={color}
            size={size}
            {...label && { label }}
            {...((label && labelPosition) && { labelPosition })}
            {...(labelOff && { offLabel: labelOff })}
            {...(labelOn && { onLabel: labelOn })}
            {...(iconActive && iconInactive) && {
                thumbIcon: value ? iconActive : iconInactive
            }}
            classNames={classNames}
        />
    </div>
}

export default SwitchMantine;


/* 

        classNames={{
            // * Padre directo
            root: StyleModule.root, // Contenedor padre, contiene tanto el label como el switch

            // * Hijos del padre directo

            // ? contenedor del label
            labelWrapper: StyleModule.labelWrapper, // Cotenedor del label

            // componentes hijos del contenedor del label
            label: `${StyleModule.label} nunito-bold`,

            // ? contenedor del input
            body: StyleModule.body,

            // componentes hijos del contenedor del input
            thumb: StyleModule.thumb, // Bola que se mueve al hacer click
            track: StyleModule.track, // Fondo del switch
            trackLabel: `nunito-bold ${StyleModule.trackLabel}`, // Texto que se muestra dentro del switch

            // ? Error
            error: StyleModule.error, // Texto que se muestra debajo del switch cuando hay un error

            // ? Descripcion
            description: StyleModule.description, // Texto que se muestra debajo del switch

            input: StyleModule.input, // input interno, que no se ve, pero se puede estilar el focus y otras props
        }}

*/