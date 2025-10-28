import { RangeSlider, Text } from "@mantine/core";
import style from "./RangeSlicerMantine.module.css";
import { memo, useEffect, useMemo, useState } from "react";

interface RangeSlicerMantineProps {
    min: number;
    max: number;
    value: [number, number];
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    radius?: "xs" | "sm" | "md" | "lg" | "xl";
    onChange: (value: [number, number]) => void;
    labelMark?: boolean;
    minRange?: number;
}

const RangeSlicerMantine = memo(({
    min,
    max,
    value,
    size = "md",
    radius = "md",
    onChange,
    labelMark,
    minRange = 0,
}: RangeSlicerMantineProps) => {

    const [values, setValues] = useState<[number, number]>(value);

    function niceStep(min: number, max: number, targetTicks = 6) {
        const span = max - min;
        if (span <= 0) return 1;

        const raw = span / targetTicks;
        const pow10 = Math.pow(10, Math.floor(Math.log10(Math.abs(raw))));
        const m = raw / pow10;
        const factor = m >= 5 ? 5 : m >= 2 ? 2 : 1;
        return factor * pow10;
    }

    function decimalsOfStep(step: number) {
        const s = step.toString();
        if (s.includes("e")) {
            const [, exp] = s.split("e");
            return Math.max(0, -Number(exp));
        }
        const parts = s.split(".");
        return parts[1]?.length ?? 0;
    }

    function roundTo(value: number, decimals: number) {
        const f = Math.pow(10, decimals);
        return Math.round(value * f) / f;
    }

    function buildMarks(min: number, max: number, targetTicks = 6) {
        const step = niceStep(min, max, targetTicks);
        const decs = decimalsOfStep(step);
        const first = roundTo(Math.ceil(min / step) * step, decs);

        const marks: { value: number; label?: string }[] = [];
        for (let v = first; v <= max + step * 0.5; v += step) {
            const value = roundTo(v, decs);
            if (value < min - step * 0.5 || value > max + step * 0.5) continue;
            const mark = labelMark ? { value, label: String(value) } : { value };
            marks.push(mark);
        }

        if (marks.length === 0) {
            marks.push({ value: min, label: String(min) }, { value: max, label: String(max) });
        }

        return marks;
    }

    // Memoiza marcas para estabilidad durante el drag
    const marks = useMemo(() => buildMarks(min, max, 6), [min, max, labelMark]);

    // Durante el drag: solo actualiza estado local
    const handleOnChange = (vals: [number, number]) => {
        setValues(vals);
    };

    // Al soltar: emite al padre
    const handleOnChangeEnd = (vals: [number, number]) => {
        onChange(vals);
    };

    // Sincroniza valor externo -> interno
    useEffect(() => {
        setValues(value);
    }, [value]);

    return (
        <RangeSlider
            value={values}
            size={size}
            radius={radius}
            onChange={handleOnChange}
            onChangeEnd={(v) => handleOnChangeEnd(v as [number, number])}
            labelAlwaysOn
            label={(val) => (
                <Text size="sm" className="nunito-semibold">
                    {val}
                </Text>
            )}
            minRange={minRange}
            marks={marks}
            classNames={{
                // CONTENEDORES
                root: style.root,
                trackContainer: style.trackContainer,

                // BARRAS
                track: style.track,
                bar: style.bar,

                // MARCADORES
                markWrapper: style.markWrapper,
                mark: style.mark,
                markLabel: style.markLabel,

                // MANEJADORES
                thumb: style.thumb,
                label: `nunito-semibold ${style.label}`,
            }}
            min={min}
            max={max}
        // Opcional: alinear el paso del thumb a tus marcas (si lo deseas)
        // step={niceStep(min, max)}
        />
    );
});

export default RangeSlicerMantine;
