
import { RangeSlider, Text } from "@mantine/core";
import style from "./RangeSlicerMantine.module.css";
import { memo, useEffect, useState } from "react";

interface RangeSlicerMantineProps {
    min: number;
    max: number;
    value: [number, number];
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    radius?: "xs" | "sm" | "md" | "lg" | "xl";
    onChange: (value: [number, number]) => void;
    labelMark?: boolean;
}

const RangeSlicerMantine = memo(({
    min,
    max,
    value,
    size = "xl",
    radius = "xl",
    onChange,
    labelMark,
}: RangeSlicerMantineProps) => {

    const [values, setValues] = useState<[number, number]>(value);

    function niceStep(min: number, max: number, targetTicks = 6) {
        const span = max - min;
        if (span <= 0) return 1;

        // paso "crudo" ideal para ~targetTicks
        const raw = span / targetTicks;
        const pow10 = Math.pow(10, Math.floor(Math.log10(Math.abs(raw))));
        const m = raw / pow10;

        // “redondeo bonito” del paso a 1, 2 o 5 × 10^n
        const factor = m >= 5 ? 5 : m >= 2 ? 2 : 1;
        return factor * pow10;
    }

    function decimalsOfStep(step: number) {
        // cuántos decimales necesitamos para representar step (p. ej. 0.1 -> 1, 0.005 -> 3)
        const s = step.toString();
        if (s.includes('e')) {
            // notación científica
            const [, exp] = s.split('e');
            return Math.max(0, -Number(exp));
        }
        const parts = s.split('.');
        return parts[1]?.length ?? 0;
    }

    function roundTo(value: number, decimals: number) {
        const f = Math.pow(10, decimals);
        return Math.round(value * f) / f;
    }

    function buildMarks(min: number, max: number, targetTicks = 6) {
        const step = niceStep(min, max, targetTicks);
        const decs = decimalsOfStep(step);

        // primer múltiplo de step ≥ min (alineación)
        const first = roundTo(Math.ceil(min / step) * step, decs);

        const marks: { value: number; label?: string }[] = [];
        for (let v = first; v <= max + step * 0.5; v += step) {
            const value = roundTo(v, decs);
            if (value < min - step * 0.5 || value > max + step * 0.5) continue;
            const mark = labelMark ? { value, label: String(value) } : { value };
            marks.push(mark);
        }

        // si por algún motivo quedó vacío, caemos a min y max
        if (marks.length === 0) {
            marks.push({ value: min, label: String(min) }, { value: max, label: String(max) });
        }

        return marks;
    }

    const handleOnChange = (values: [number, number]) => {
        setValues(values);
        onChange(values);
    }

    console.log(buildMarks(min, max));

    useEffect(() => {
        setValues(value);
    }, [value]);

    return (
        <RangeSlider
            value={values}
            size={size}          // controla la altura base del track
            radius={radius}        // bordes más redondeados
            onChange={handleOnChange}
            labelAlwaysOn
            label={(val) => (
                <Text size="sm" className="nunito-semibold">
                    {val}
                </Text>
            )}
            marks={buildMarks(min, max)}
            // thumbProps={(index) => ({
            //     className: index === 0 ? style.thumbFrom : style.thumbTo,
            // })}
            classNames={{
                // CONTENEDORES
                root: style.root, // contenedor principal que encapsula todo el componente
                trackContainer: style.trackContainer, // contenedor que contiene la barra mostrada desde el valor minimo hasta el valor maximo(pista base) y sus nodos hijos(marcadores, barra seleccionada)

                // BARRAS
                track: style.track, // barra mostrada desde el valor minimo hasta el valor maximo(pista base)
                bar: style.bar, // rango de la barra seleccionada

                // MARCADORES
                markWrapper: style.markWrapper, // contenedor que contiene el marcador y su texto
                mark: style.mark, // punto en la pista que indica un separador
                markLabel: style.markLabel, // texto que acompaña al marcador

                // MANEJADORES
                thumb: style.thumb, // Manejadores que arrastrar para definir el rango
                label: `nunito-semibold ${style.label}`, // texto que acompaña al rango
            }}
            min={min}
            max={max}
        />
    );
});


export default RangeSlicerMantine;
