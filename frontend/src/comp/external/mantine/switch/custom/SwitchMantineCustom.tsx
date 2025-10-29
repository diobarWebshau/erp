import type { JSX, ReactNode } from "react"
import SwitchMantine from "../base/SwitchMantine"
import StyleModule from "./SwitchMantineCustom.module.css"
import withClassName from "../../../../../utils/withClassName";

interface ISwitchMantineCustomProps {
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
}

const SwitchMantineCustom = ({
    value,
    onChange,
    size,
    label,
    labelOff,
    labelOn,
    labelPosition,
    iconActive,
    iconInactive,
    color
}: ISwitchMantineCustomProps) => {

    const iconActiveWithClassName = withClassName(iconActive as JSX.Element, StyleModule.iconActive, { stroke: color });
    const iconInactiveWithClassName = withClassName(iconInactive as JSX.Element, StyleModule.iconInactive);


    return <SwitchMantine
        color={color}
        value={value}
        onChange={onChange}
        size={size}
        label={label}
        labelOff={labelOff}
        labelOn={labelOn}
        labelPosition={labelPosition}
        iconActive={iconActiveWithClassName}
        iconInactive={iconInactiveWithClassName}
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
    />
}

export default SwitchMantineCustom
