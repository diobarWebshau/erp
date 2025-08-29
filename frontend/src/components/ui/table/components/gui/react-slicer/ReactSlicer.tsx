import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Range, getTrackBackground } from "react-range";
import type { ColumnTypeDataFilter } from "../../../types";
import styles from "./ReactSlider.module.css";

interface ObjectNumericFilter {
  min: number;
  max: number;
}

interface NumberSlicerProps {
  min: number;
  max: number;
  step?: number;
  initialValue?: ColumnTypeDataFilter;
  setInitialValue?: Dispatch<SetStateAction<ColumnTypeDataFilter>>;
  label?: string;
  width?: number | string;
  className?: string;
  beforeRangeColor?: string;
  afterRangeColor?: string;
  rangeColor?: string;
  classNameLabel?: string;
  classNameTrack?: string;
  classNameMarks?: string;
  classNameThumb?: string;
  classNameFontContainer?: string;
  classNameSubTitleMinMax?: string;
  classNameContainerInputs?: string;
}

// filterInputValues[header.column.id]

const NumberSlicerReactRange = ({
  min,
  max,
  step = 1,
  initialValue,
  setInitialValue,
  label = "Select Range",
  width = "100%",
  className,
  beforeRangeColor = "#ddd",
  afterRangeColor = "#ddd",
  rangeColor = "#0d6efd",
  classNameLabel = "",
  classNameTrack = "",
  classNameMarks = "",
  classNameThumb = "",
  classNameFontContainer = "",
  classNameSubTitleMinMax = "",
  classNameContainerInputs = "",
}: NumberSlicerProps) => {

  console.log("min", min);
  console.log("max", max);

  function getMarkStep(max: number): number {
    // valor maximo 999
    if (max <= 0) return 1; // caso de que sea menor o igual a cero el maxinmo
    const exponent =
      Math.floor( // redondea hacia abajo el exponente del maximo en base 10 (logaritmo base 10) del numero maximo(Ej: 999 -> 2.99, 100 -> 2) para obtener una separación entre los marcadores
        Math.log10(max) // Se obtiene el exponente del maximo en base 10 (logaritmo base 10) del numero maximo (Ej: 999 -> 2.99)
      );
    return Math.pow(10, exponent); // Se eleva 10 al exponente obtenido para obtener el valor del marcador(Ej: 10^2 = 100)
  }


  // function getMarkStep(max: number, targetMarks = 5): number {
  //   if (max <= 0) return 1;

  //   const roughStep = max / targetMarks;
  //   const exponent = Math.floor(Math.log10(roughStep));
  //   const base = Math.pow(10, exponent);

  //   // Escalamos para obtener steps más agradables (1, 2, 5, 10, 20, 50, etc.)
  //   const steps = [1, 2, 5, 10];
  //   for (const step of steps) {
  //     const candidate = step * base;
  //     if (max / candidate <= targetMarks) {
  //       return candidate;
  //     }
  //   }

  //   return 10 * base; // fallback
  // }


  console.log(initialValue);

  const initialValueNumeric = initialValue as ObjectNumericFilter;


  const [values, setValues] = useState<[number, number]>([
    initialValueNumeric?.min || min,
    initialValueNumeric?.max || max
  ]);

  // función que se ejecuta cuando se produce un cambio en el input
  const handleInputChange = (index: 0 | 1, valStr: string) => {
    let val = Number(valStr);
    if (isNaN(val)) return;

    if (index === 0) {
      val = Math.min(Math.max(val, min), values[1]);
    } else {
      val = Math.max(Math.min(val, max), values[0]);
    }

    const newVals: [number, number] = [...values];
    newVals[index] = val;
    setValues(newVals);
    setInitialValue?.({ min: newVals[0], max: newVals[1] });
  };

  // función que se ejecuta cuando se produce un cambio en el rango
  const handleChange = (vals: number[]) => {
    const newVals: [number, number] = [vals[0], vals[1]];
    setValues(newVals);
    setInitialValue?.({ min: newVals[0], max: newVals[1] });
  };

  const marks: number[] = [];
  for (let i = min; i <= max; i += getMarkStep(max)) {
    marks.push(i);
  }


  useEffect(() => {
    setValues([
      initialValueNumeric?.min || min,
      initialValueNumeric?.max || max
    ]);
  }, [initialValue]);

  return (
    <div
      className={`${styles.container} ${className} ${classNameFontContainer}`}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
    >
      <label className={`${styles.label} ${classNameLabel}`}>{label}</label>
      <Range
        step={step}
        min={min}
        max={max}
        values={values}
        onChange={handleChange}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className={`${styles.track} ${classNameTrack}`}
            style={{
              ...props.style,
              background: getTrackBackground({
                values,
                colors: [beforeRangeColor, rangeColor, afterRangeColor],
                min,
                max,
              }),
            }}
          >
            <div className={`${styles.marksContainer} ${classNameMarks}`}>
              {marks.map((mark) => (
                <div key={mark} className={styles.mark} />
              ))}
            </div>
            {children}
          </div>
        )}
        renderThumb={({ props, index }) => {
          const { key, ...rest } = props;

          return (
            <div key={key} {...rest} className={`${styles.thumb} ${classNameThumb}`}>
              <div className={styles.thumbLabel}>{values[index]}</div>
              <div className={styles.thumbInnerDot} />
            </div>
          );
        }}
      />

      <div className={`${styles.sectionInputContainer} ${classNameContainerInputs}`}>
        <div className={styles.inputContainer}>
          <label htmlFor="min" className={`${styles.labelMin} ${classNameSubTitleMinMax}`}>Min</label>
          <input
            name="min"
            type="number"
            min={min}
            max={values[1]}
            step={step}
            value={values[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.symbolRange}>
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="max" className={`${styles.labelMax} ${classNameSubTitleMinMax}`}>Max</label>
          <input
            name="max"
            type="number"
            min={values[0]}
            max={max}
            step={step}
            value={values[1]}
            onChange={(e) => handleInputChange(1, e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

    </div>

  );
};

export default NumberSlicerReactRange;
