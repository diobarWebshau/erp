import { Divider, Text } from "@mantine/core";
import RangeSlicerMantine from "../base/RangeSlicerMantine";
import style from "./RangeSlicerMantineTable.module.css";
import { useEffect, useMemo, useState } from "react";
import type { ObjectNumericFilter } from "../../../../../../../interfaces/tableTypes";
import NumericInputCustomMemo from "../../../../../../primitives/input/numeric/custom/NumericInputCustom";

interface RangeSlicerMantineTableProps {
  min: number;
  max: number;
  value: ObjectNumericFilter;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  radius?: "xs" | "sm" | "md" | "lg" | "xl";
  onChange: (value: ObjectNumericFilter) => void;
  labelMark?: boolean;
  /** Diferencia mínima (max - min). Si no se pasa o <= 0, no se aplica. */
  minRange?: number;
}

const RangeSlicerMantineTable = ({
  min,
  max,
  value,
  size = "md",
  radius = "md",
  onChange,
  labelMark,
  minRange,
}: RangeSlicerMantineTableProps) => {
  const [minValue, setMinValue] = useState<number>(value?.min ?? min);
  const [maxValue, setMaxValue] = useState<number>(value?.max ?? max);

  /** igualdad simple para evitar renders innecesarios */
  const eq = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];

  /** utils */
  const range = useMemo(() => Math.max(0, (minRange ?? 0)), [minRange]);
  const hasRange = range > 0;

  const clamp = (n: number) => (n < min ? min : n > max ? max : n);

  /** Normaliza un par cuando cambia MIN desde input */
  const normalizeFromMin = (nMin: number, currentMax: number): [number, number] => {
    let newMin = clamp(nMin);
    let newMax = clamp(currentMax);

    // Asegura min <= max
    if (newMin > newMax) newMin = newMax;

    // Respeta minRange (empujando max si hay espacio)
    if (hasRange && newMax - newMin < range) {
      const candidateMax = clamp(newMin + range);
      if (candidateMax <= max) {
        newMax = candidateMax;
      } else {
        // Si no hay espacio para empujar max, retrocede min lo necesario
        newMin = clamp(newMax - range);
      }
    }
    return [newMin, newMax];
  };

  /** Normaliza un par cuando cambia MAX desde input */
  const normalizeFromMax = (currentMin: number, nMax: number): [number, number] => {
    let newMin = clamp(currentMin);
    let newMax = clamp(nMax);

    // Asegura min <= max
    if (newMin > newMax) newMax = newMin;

    // Respeta minRange (empujando min si hay espacio)
    if (hasRange && newMax - newMin < range) {
      const candidateMin = clamp(newMax - range);
      if (candidateMin >= min) {
        newMin = candidateMin;
      } else {
        // Si no hay espacio para empujar min, adelanta max lo necesario
        newMax = clamp(newMin + range);
      }
    }
    return [newMin, newMax];
  };

  /** Normaliza un par cuando viene del slider */
  const normalizeFromSlider = (nMin: number, nMax: number): [number, number] => {
    let newMin = clamp(nMin);
    let newMax = clamp(nMax);

    if (newMin > newMax) [newMin, newMax] = [newMax, newMin];

    if (hasRange && newMax - newMin < range) {
      // Intenta expandir hacia el lado más cercano respetando límites
      const half = Math.ceil((range - (newMax - newMin)) / 2);
      let candMin = clamp(newMin - half);
      let candMax = clamp(newMax + half);

      // Ajusta si aún no alcanza
      if (candMax - candMin < range) {
        // prioriza expandir a la derecha si hay espacio
        const need = range - (candMax - candMin);
        if (candMax + need <= max) {
          candMax = candMax + need;
        } else if (candMin - need >= min) {
          candMin = candMin - need;
        } else {
          // Como último recurso, fija al mínimo posible empezando en min
          candMin = min;
          candMax = clamp(min + range);
        }
      }

      newMin = candMin;
      newMax = candMax;
    }

    return [newMin, newMax];
  };

  /** Cambio desde el slider */
  const handleOnChange = (next: [number, number]) => {
    const [nm, nx] = normalizeFromSlider(next[0], next[1]);
    if (!eq([minValue, maxValue], [nm, nx])) {
      setMinValue(nm);
      setMaxValue(nx);
      onChange({ min: nm, max: nx });
    }
  };

  /** Sincronía con valor externo */
  useEffect(() => {
    const incoming: [number, number] = [
      value?.min ?? min,
      value?.max ?? max
    ];

    // También normalizamos por si el exterior manda algo fuera de rango
    const [nm, nx] = normalizeFromSlider(incoming[0], incoming[1]);

    if (!eq([minValue, maxValue], [nm, nx])) {
      setMinValue(nm);
      setMaxValue(nx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max, range]); // si cambian los límites o minRange, re-normaliza

  /** Inputs individuales */
  const handleOnChangeInputMin = (val: number) => {
    const [nm, nx] = normalizeFromMin(val, maxValue);
    if (!eq([minValue, maxValue], [nm, nx])) {
      setMinValue(nm);
      setMaxValue(nx);
      onChange({ min: nm, max: nx });
    }
  };

  const handleOnChangeInputMax = (val: number) => {
    const [nm, nx] = normalizeFromMax(minValue, val);
    if (!eq([minValue, maxValue], [nm, nx])) {
      setMinValue(nm);
      setMaxValue(nx);
      onChange({ min: nm, max: nx });
    }
  };

  return (
    <div className={style.containerMain}>
      <div className={style.containerContent}>
        <Text className={`nunito-bold ${style.labelTitle}`}>Rango</Text>

        <div className={style.containerRangeSlicer}>
          <RangeSlicerMantine
            min={min}
            max={max}
            value={[minValue, maxValue]}
            size={size}
            radius={radius}
            onChange={handleOnChange}
            labelMark={labelMark}
            minRange={minRange}
          />

          <div className={style.containerLabelTextInput}>
            <Text className={style.labelTextInput}> Min</Text>
            <Text className={style.labelTextInput}> Max</Text>
          </div>

          <div className={style.containerInputNumericInput}>
            <NumericInputCustomMemo
              value={minValue}
              onChange={handleOnChangeInputMin}
              classNameInput={style.inputContainerNumericInput}
              min={min}
              max={max}
            />
            <Divider className={style.divider} size="xs" color="gray" />
            <NumericInputCustomMemo
              value={maxValue}
              onChange={handleOnChangeInputMax}
              classNameInput={style.inputContainerNumericInput}
              min={min}
              max={max}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RangeSlicerMantineTable;
