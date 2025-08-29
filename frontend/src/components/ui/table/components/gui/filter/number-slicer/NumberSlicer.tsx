import React, { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import "./number-slicer.module.css";

import type { ObjectNumericFilter } from "../../../../types";

interface NumberSlicerProps {
  min: number;
  max: number;
  step?: number;
  value?: ObjectNumericFilter;
  onChange?: (value: ObjectNumericFilter) => void;
  label?: string;
  mode?: "range" | "single";
}

const NumberSlicer = ({
  min,
  max,
  step = 1,
  value = { min: undefined, max: undefined },
  onChange,
  label = "Range",
  mode = "range",
}: NumberSlicerProps) => {
  const isSingle = mode === "single";

  const [initialized, setInitialized] = useState(false);

  // Estados numéricos internos
  const [minVal, setMinVal] = useState<number>(value?.min ?? min);
  const [maxVal, setMaxVal] = useState<number>(value?.max ?? max);

  // Input único para "range" o input numérico para "single"
  // En modo range, es texto con formato "min-max"
  const [inputText, setInputText] = useState<string>(
    isSingle
      ? String(value?.min ?? min)
      : value?.min !== undefined && value?.max !== undefined
      ? `${value.min}-${value.max}`
      : `${min}-${max}`
  );

  const rangeRef = useRef<HTMLDivElement>(null);

  // Sincroniza props con estados internos (solo actualiza estado, NO llama onChange para evitar loop)
  useEffect(() => {
    if (isSingle) {
      if (value.min !== undefined && value.min !== minVal) {
        setMinVal(value.min);
        setInputText(String(value.min));
      }
    } else {
      // modo range
      if (
        (value.min !== undefined && value.min !== minVal) ||
        (value.max !== undefined && value.max !== maxVal)
      ) {
        setMinVal(value.min ?? min);
        setMaxVal(value.max ?? max);
        if (value.min !== undefined && value.max !== undefined) {
          setInputText(`${value.min}-${value.max}`);
        } else {
          setInputText(`${min}-${max}`);
        }
      }
    }
  }, [value.min, value.max]);

  // Inicialización: emitir onChange al montar
  useEffect(() => {
    if (!initialized && onChange) {
      onChange(isSingle ? { min: minVal } : { min: minVal, max: maxVal });
      setInitialized(true);
    }
  }, [initialized, minVal, maxVal, onChange, isSingle]);

  // Actualiza visualmente el rango activo en slider (solo un slider)
  useEffect(() => {
    if (!rangeRef.current) return;

    if (!isSingle) {
      const minPercent = ((minVal - min) / (max - min)) * 100;
      const maxPercent = ((maxVal - min) / (max - min)) * 100;
      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    } else {
      const widthPercent = ((minVal - min) / (max - min)) * 100;
      rangeRef.current.style.left = "0%";
      rangeRef.current.style.width = `${widthPercent}%`;
    }
  }, [minVal, maxVal, min, max, isSingle]);

  // Manejador slider único
  const handleSliderChange = (val: number) => {
    if (isSingle) {
      setMinVal(val);
      setInputText(String(val));
      onChange?.({ min: val });
    } else {
      // Para rango, ajustamos minVal y maxVal para que val quede entre ellos
      // Si val está más cerca de minVal, movemos minVal, si está más cerca de maxVal, movemos maxVal
      const middle = (minVal + maxVal) / 2;
      if (val <= middle) {
        const clamped = Math.min(val, maxVal);
        setMinVal(clamped);
        setInputText(`${clamped}-${maxVal}`);
        onChange?.({ min: clamped, max: maxVal });
      } else {
        const clamped = Math.max(val, minVal);
        setMaxVal(clamped);
        setInputText(`${minVal}-${clamped}`);
        onChange?.({ min: minVal, max: clamped });
      }
    }
  };

  return (
    <div className="range-slicer">
      <label className="label">
        <SlidersHorizontal size={18} /> {label}
      </label>

      <div className="inputs">
        {isSingle ? (
          <input
            type="number"
            value={inputText}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const val = Number(e.target.value);
              setInputText(e.target.value);
              if (!isNaN(val)) {
                setMinVal(val);
                onChange?.({ min: val });
              }
            }}
          />
        ) : (
          <input
            type="text"
            placeholder={`${min}-${max}`}
            value={inputText}
            onChange={(e) => {
              const raw = e.target.value;
              setInputText(raw);

              const parts = raw.split("-");
              if (parts.length === 2) {
                const partMin = parts[0].trim();
                const partMax = parts[1].trim();
                const parsedMin = Number(partMin);
                const parsedMax = Number(partMax);

                if (
                  !isNaN(parsedMin) &&
                  !isNaN(parsedMax) &&
                  parsedMin >= min &&
                  parsedMax <= max &&
                  parsedMin <= parsedMax
                ) {
                  setMinVal(parsedMin);
                  setMaxVal(parsedMax);
                  onChange?.({ min: parsedMin, max: parsedMax });
                }
              }
            }}
          />
        )}
      </div>

      <div className="slider-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={isSingle ? minVal : (minVal + maxVal) / 2}
          onChange={(e) => handleSliderChange(+e.target.value)}
          className="thumb"
        />

        <div className="slider">
          <div className="track" />
          <div className="range" ref={rangeRef} />
        </div>
      </div>
    </div>
  );
};

export default NumberSlicer;
