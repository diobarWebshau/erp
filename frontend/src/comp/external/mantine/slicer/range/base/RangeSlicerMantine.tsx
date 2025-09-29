import { useEffect, useMemo, useState } from "react";
import { RangeSlider, Text, Group, NumberInput, Box, Stack } from "@mantine/core";
import styles from "./RangeSlicerMantine.module.css";

export type NumberRange = { min: number; max: number };

interface Props {
    min: number;
    max: number;
    step?: number;

    /** Controlado */
    value?: NumberRange;
    onChange?: (range: NumberRange) => void;

    /** No controlado */
    defaultValue?: NumberRange;

    /** UI */
    label?: string;
    width?: number | string;

    /** Colores (usados por CSS via data-attrs) */
    beforeRangeColor?: string; // track base
    afterRangeColor?: string;  // (mismo que before, Mantine no separa antes/después)
    rangeColor?: string;       // bar (rango seleccionado)

    /** Solo classNames de Mantine (y wrappers) */
    className?: string;                 // contenedor externo
    classNameLabel?: string;            // etiqueta superior
    classNameTrack?: string;            // RangeSlider.track
    classNameMarks?: string;            // mark / markWrapper / markLabel
    classNameThumb?: string;            // RangeSlider.thumb
    classNameFontContainer?: string;    // RangeSlider.root
    classNameSubTitleMinMax?: string;   // “Min/Max” (Text)
    classNameContainerInputs?: string;  // contenedor de inputs
}

const GenericNumberRangeMantine = ({
    min,
    max,
    step = 1,
    value,
    onChange,
    defaultValue,
    label = "Select Range",
    width = "100%",
    beforeRangeColor = "#ddd",
    afterRangeColor = "#ddd",
    rangeColor = "#0d6efd",
    className = "",
    classNameLabel = "",
    classNameTrack = "",
    classNameMarks = "",
    classNameThumb = "",
    classNameFontContainer = "",
    classNameSubTitleMinMax = "",
    classNameContainerInputs = "",
}: Props) => {
    // estado interno solo si es no controlado
    const isControlled = value !== undefined;
    const [inner, setInner] = useState<[number, number]>(() => {
        const dv = defaultValue ?? { min, max };
        return [dv.min ?? min, dv.max ?? max];
    });

    const current: [number, number] = isControlled
        ? [Math.max(min, Math.min(max, value!.min)), Math.max(min, Math.min(max, value!.max))]
        : inner;

    // step para marcas “agradable”
    const getMarkStep = (mx: number) => {
        if (mx <= 0) return 1;
        const exponent = Math.floor(Math.log10(mx));
        return Math.pow(10, exponent);
    };

    const marks = useMemo(() => {
        const arr: { value: number; label?: string }[] = [];
        const stepMark = getMarkStep(max);
        for (let v = min; v <= max; v += stepMark) arr.push({ value: v });
        return arr;
    }, [min, max]);

    const emit = (vals: [number, number]) => {
        const clamped: [number, number] = [
            Math.max(min, Math.min(vals[0], vals[1])),
            Math.min(max, Math.max(vals[1], vals[0])),
        ];
        if (!isControlled) setInner(clamped);
        onChange?.({ min: clamped[0], max: clamped[1] });
    };

    const handleSlider = (vals: number[] | [number, number]) => emit(vals as [number, number]);

    const handleInputChange = (idx: 0 | 1, val: number | string) => {
        const n = Number(val);
        if (Number.isNaN(n)) return;
        const next: [number, number] = [...current] as [number, number];
        if (idx === 0) next[0] = Math.min(Math.max(n, min), next[1]);
        else next[1] = Math.max(Math.min(n, max), next[0]);
        emit(next);
    };

    // si cambian límites y estamos no controlados, realinear
    useEffect(() => {
        if (!isControlled) {
            setInner(([a, b]) => [Math.max(min, Math.min(a, max)), Math.max(min, Math.min(b, max))]);
        }
    }, [min, max, isControlled]);

    const containerStyle = typeof width === "number" ? { width: `${width}px` } : { width };

    return (
        <Box
            className={`${styles.container} ${className}`}
            style={containerStyle}
            data-beforecolor={beforeRangeColor}
            data-aftercolor={afterRangeColor}
            data-rangecolor={rangeColor}
        >
            <Text className={`${styles.label} ${classNameLabel}`} component="label">
                {label}
            </Text>

            <RangeSlider
                value={current}
                onChange={(v) => handleSlider(v as [number, number])}
                min={min}
                max={max}
                step={step}
                marks={marks}
                labelAlwaysOn
                classNames={{
                    root: `${styles.sliderRoot} ${classNameFontContainer}`,
                    trackContainer: styles.trackContainer,
                    track: `${styles.track} ${classNameTrack}`,
                    bar: styles.bar,
                    thumb: `${styles.thumb} ${classNameThumb}`,
                    markWrapper: `${styles.markWrapper} ${classNameMarks}`,
                    mark: `${styles.mark} ${classNameMarks}`,
                    markLabel: `${styles.markLabel} ${classNameMarks}`,
                    label: styles.thumbLabel,
                }}
            />

            <Group
                justify="center"
                className={`${styles.sectionInputContainer} ${classNameContainerInputs}`}
            >
                <Stack align="center" className={styles.inputContainer}>
                    <Text className={`${styles.labelMin} ${classNameSubTitleMinMax}`} component="label">
                        Min
                    </Text>
                    <NumberInput
                        value={current[0]}
                        onChange={(val) => handleInputChange(0, val ?? current[0])}
                        min={min}
                        max={current[1]}
                        step={step}
                        clampBehavior="strict"
                        classNames={{ input: styles.input }}
                    />
                </Stack>

                <div className={styles.symbolRange} />

                <Stack align="center" className={styles.inputContainer}>
                    <Text className={`${styles.labelMax} ${classNameSubTitleMinMax}`} component="label">
                        Max
                    </Text>
                    <NumberInput
                        value={current[1]}
                        onChange={(val) => handleInputChange(1, val ?? current[1])}
                        min={current[0]}
                        max={max}
                        step={step}
                        clampBehavior="strict"
                        classNames={{ input: styles.input }}
                    />
                </Stack>
            </Group>
        </Box>
    );
};

export default GenericNumberRangeMantine;
