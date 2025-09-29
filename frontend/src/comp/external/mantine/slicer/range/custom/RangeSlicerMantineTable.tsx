import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { RangeSlider, Text, Group, NumberInput, Box, Stack } from "@mantine/core";
import type { ColumnTypeDataFilter, ObjectNumericFilter } from "../../../../../../interfaces/tableTypes";
import styles from "./RangeSlicerMantineTable.module.css";

interface RangeSlicerMantineTableProps {
    min: number;
    max: number;
    step?: number;
    initialValue?: ColumnTypeDataFilter;
    setInitialValue?: Dispatch<SetStateAction<ColumnTypeDataFilter>>;
    label?: string;
    width?: number | string;

    // colores (opcional): se reflejan vía CSS en .track/.bar
    beforeRangeColor?: string; // fondo de track (fuera del rango)
    afterRangeColor?: string;  // (mismo que before; RangeSlider no separa “antes”/“después” por defecto)
    rangeColor?: string;       // color del rango seleccionado (bar)

    // classNames “puros” de Mantine
    className?: string;                 // contenedor externo
    classNameLabel?: string;            // etiqueta superior
    classNameTrack?: string;            // RangeSlider.track
    classNameMarks?: string;            // RangeSlider.mark / markWrapper / markLabel
    classNameThumb?: string;            // RangeSlider.thumb
    classNameFontContainer?: string;    // RangeSlider.root
    classNameSubTitleMinMax?: string;   // “Min/Max” (Text)
    classNameContainerInputs?: string;  // contenedor de inputs
}

const RangeSlicerMantineTable = ({
    min,
    max,
    step = 1,
    initialValue,
    setInitialValue,
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
}: RangeSlicerMantineTableProps) => {
    const initialValueNumeric = initialValue as ObjectNumericFilter | undefined;

    const [values, setValues] = useState<[number, number]>([
        initialValueNumeric?.min ?? min,
        initialValueNumeric?.max ?? max,
    ]);

    // calcula paso de marcas “agradable” en escala de 10
    const getMarkStep = (mx: number) => {
        if (mx <= 0) return 1;
        const exponent = Math.floor(Math.log10(mx));
        return Math.pow(10, exponent);
    };

    // genera marcas para Mantine (sin labels visibles; puedes activarlas si quieres)
    const marks = useMemo(() => {
        const arr: { value: number; label?: string }[] = [];
        const stepMark = getMarkStep(max);
        for (let v = min; v <= max; v += stepMark) {
            arr.push({ value: v });
        }
        return arr;
    }, [min, max]);

    const handleChange = (vals: [number, number]) => {
        const clamped: [number, number] = [
            Math.max(min, Math.min(vals[0], vals[1])),
            Math.min(max, Math.max(vals[1], vals[0])),
        ];
        setValues(clamped);
        setInitialValue?.({ min: clamped[0], max: clamped[1] });
    };

    const handleInputChange = (idx: 0 | 1, val: number | string) => {
        const n = Number(val);
        if (Number.isNaN(n)) return;
        const next: [number, number] = [...values] as [number, number];
        if (idx === 0) {
            next[0] = Math.min(Math.max(n, min), next[1]);
        } else {
            next[1] = Math.max(Math.min(n, max), next[0]);
        }
        setValues(next);
        setInitialValue?.({ min: next[0], max: next[1] });
    };

    // sincroniza cuando cambia initialValue externamente
    useEffect(() => {
        setValues([
            initialValueNumeric?.min ?? min,
            initialValueNumeric?.max ?? max,
        ]);
    }, [initialValueNumeric?.min, initialValueNumeric?.max, min, max]);

    // Estilos por clase (no inline): exponemos CSS variables que usaremos en el módulo
    const containerStyle =
        typeof width === "number" ? { width: `${width}px` } : { width };

    return (
        <Box
            className={`${styles.container} ${className}`}
            style={containerStyle}
            // variables para que el CSS module pinte track/bar con classNames puros
            data-beforecolor={beforeRangeColor}
            data-aftercolor={afterRangeColor}
            data-rangecolor={rangeColor}
        >
            <Text className={`${styles.label} ${classNameLabel}`} component="label">
                {label}
            </Text>

            <RangeSlider
                value={values}
                onChange={(v) => handleChange(v as [number, number])}
                min={min}
                max={max}
                step={step}
                marks={marks}
                labelAlwaysOn
                // Solo classNames (sin styles inline)
                classNames={{
                    root: `${styles.sliderRoot} ${classNameFontContainer}`,
                    trackContainer: styles.trackContainer,
                    track: `${styles.track} ${classNameTrack}`,
                    bar: styles.bar, // el rango seleccionado
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
                        value={values[0]}
                        onChange={(val) => handleInputChange(0, val ?? values[0])}
                        min={min}
                        max={values[1]}
                        step={step}
                        clampBehavior="strict"
                        classNames={{
                            input: styles.input,
                        }}
                    />
                </Stack>

                <div className={styles.symbolRange} />

                <Stack align="center" className={styles.inputContainer}>
                    <Text className={`${styles.labelMax} ${classNameSubTitleMinMax}`} component="label">
                        Max
                    </Text>
                    <NumberInput
                        value={values[1]}
                        onChange={(val) => handleInputChange(1, val ?? values[1])}
                        min={values[0]}
                        max={max}
                        step={step}
                        clampBehavior="strict"
                        classNames={{
                            input: styles.input,
                        }}
                    />
                </Stack>
            </Group>
        </Box>
    );
};

export default RangeSlicerMantineTable;
