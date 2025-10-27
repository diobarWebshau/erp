import { Divider, Text } from "@mantine/core";
import RangeSlicerMantine from "../base/RangeSlicerMantine"
import style from "./RangeSlicerMantineTable.module.css"
import { useEffect, useState } from "react";
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
}

const RangeSlicerMantineTable = ({
    min,
    max,
    value,
    size = "xl",
    radius = "xl",
    onChange,
    labelMark,
}: RangeSlicerMantineTableProps) => {

    const [values, setValues] = useState<[number, number]>([value?.min ?? min, value?.max ?? max]);

    const handleOnChange = (values: [number, number]) => {
        setValues(values);
        onChange({ min: values[0], max: values[1] });
    }

    useEffect(() => {
        setValues([value?.min ?? min, value?.max ?? max]);
    }, [value]);

    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "var(--color-theme-font-white) !important",
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2rem",
                }}
            >
                <Text className={`nunito-bold ${style.labelText}`}>Rango</Text>
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                    }}
                >

                    <RangeSlicerMantine
                        min={min}
                        max={max}
                        value={values}
                        size={size}
                        radius={radius}
                        onChange={handleOnChange}
                        labelMark={labelMark}
                    />
                    <div
                        style={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                        }}
                    >
                        <Text className={style.labelTextInput}> Min</Text>
                        <Text className={style.labelTextInput}> Max</Text>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-around",
                            gap: "0.5rem"
                        }}
                    >
                        <NumericInputCustomMemo
                            value={values[0]}
                            onChange={(e) => setValues([Number(e), values[1]])}
                            classNameInput={style.inputContainerNumericInput}

                        />
                        <Divider className={style.divider} size="xs" color="gray" />
                        <NumericInputCustomMemo
                            value={values[1]}
                            onChange={(e) => setValues([values[0], Number(e)])}
                            classNameInput={style.inputContainerNumericInput}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RangeSlicerMantineTable;
