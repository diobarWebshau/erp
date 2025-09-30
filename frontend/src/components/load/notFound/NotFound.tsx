import { useState } from "react";
import RangeDayPickerMantine from "../../../comp/external/mantine/date/range/base/RangeDayPickerMantine";
import MultipleDayPickerMantine from "../../../comp/external/mantine/date/multiple/base/MultipleDayPickerMantine";
import StandardDayPickerMantine from "../../../comp/external/mantine/date/standar/base/StandardDayPickedMantine";
import DayPickerDateInputMantine from "../../../comp/external/mantine/date/input/base/DateInputMantine";
import GenericNumberRangeMantine, { type NumberRange } from "../../../comp/external/mantine/slicer/range/base/RangeSlicerMantine";
import { Button, Stack, Text, Group, RangeSlider, Input, Divider } from "@mantine/core";
import style from "./NotFound.module.css";
import NumericInput from "../../../comp/primitives/input/numeric/base/NumericInput";
import Separator from "../../../comp/primitives/separator/Separator";
import RangeSlicerMantine from "../../../comp/external/mantine/slicer/range/table/base/RangeSlicerMantine";
import RangeSlicerMantineTable from "../../../comp/external/mantine/slicer/range/table/custom/RangeSlicerMantineTable";
import MainLayout from "../../../layouts/main/Main";

const NotFound = () => {

    const [value, setValue] = useState<Date | null>(null);
    const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);
    const [multipleDates, setMultipleDates] = useState<Date[]>([]);
    const [rangeNumber, setRangeNumber] = useState<NumberRange>({ min: 100, max: 600 });

    const reset = () => setRangeNumber({ min: 100, max: 600 });

    const [values, setValues] = useState<[number, number]>([100, 600]);

    const handleOnChange = (values: { min: number; max: number }) => {
        setValues([values.min, values.max]);
        setRangeNumber(values);
    }


    return (
        <MainLayout/>
        // <div
        //     style={{
        //         display: "flex",
        //         flexDirection: "row",
        //         alignItems: "center",
        //         justifyContent: "center",
        //         width: "100%",
        //         height: "100%",
        //         backgroundColor: "rgba(240, 255, 174, 0.712)",
        //         padding: "5rem",
        //         gap: "1rem",
        //     }}
        // >
        //     {/* <RangeDayPickerMantine value={range} onChange={setRange} />
        //     <MultipleDayPickerMantine value={multipleDates} onChange={setMultipleDates} />
        //     <StandardDayPickerMantine value={value} onChange={setValue} />
        //     <DayPickerDateInputMantine /> */}
        //     {/* <Stack gap="md">
        //         <GenericNumberRangeMantine
        //         min={0}
        //         max={1000}
        //         step={5}
        //         label="Rango controlado"
        //         value={rangeNumber}
        //         onChange={setRangeNumber}
        //         rangeColor="#0d6efd"
        //         />
                
        //         <Group justify="space-between">
        //         <Text>Actual: {rangeNumber.min} – {rangeNumber.max}</Text>
        //         <Button variant="light" onClick={reset}>Reset</Button>
        //         </Group>
        //         </Stack> */}
        //     <div
        //         style={{
        //             width: "300px",
        //             display: "flex",
        //             flexDirection: "column",
        //             alignItems: "center",
        //             justifyContent: "center",
        //             backgroundColor: "var(--color-theme-font-white) !important",
        //         }}
        //     >
        //         <div
        //             style={{
        //                 width: "100%",
        //                 height: "100%",
        //                 display: "flex",
        //                 flexDirection: "column",
        //                 alignItems: "center",
        //                 justifyContent: "center",
        //                 gap: "2rem",
        //             }}
        //         >
        //             <Text className={`nunito-bold ${style.labelText}`}>Rango</Text>
        //             <div
        //                 style={{
        //                     width: "100%",
        //                     height: "100%",
        //                     display: "flex",
        //                     flexDirection: "column",
        //                     alignItems: "center",
        //                     justifyContent: "center",
        //                     gap: "0.5rem",
        //                 }}
        //             >
        //                 <RangeSlider
        //                     value={values}
        //                     size="xs"          // controla la altura base del track
        //                     radius="xs"        // bordes más redondeados
        //                     onChange={setValues}
        //                     labelAlwaysOn
        //                     label={(val) => `${val}`} // 👈 cada thumb recibe su valor
        //                     marks={
        //                         [
        //                             { value: 100 },
        //                             { value: 200 },
        //                             { value: 300 },
        //                             { value: 400 },
        //                             { value: 500 },
        //                             { value: 600 },
        //                             { value: 700 },
        //                             { value: 800 },
        //                             { value: 900 },
        //                             { value: 1000 },
        //                         ]
        //                     }
        //                     // thumbProps={(index) => ({
        //                     //     className: index === 0 ? style.thumbFrom : style.thumbTo,
        //                     // })}
        //                     classNames={{
        //                         // CONTENEDORES
        //                         root: style.root, // contenedor principal que encapsula todo el componente
        //                         trackContainer: style.trackContainer, // contenedor que contiene la barra mostrada desde el valor minimo hasta el valor maximo(pista base) y sus nodos hijos(marcadores, barra seleccionada)

        //                         // BARRAS
        //                         track: style.track, // barra mostrada desde el valor minimo hasta el valor maximo(pista base)
        //                         bar: style.bar, // rango de la barra seleccionada

        //                         // MARCADORES
        //                         markWrapper: style.markWrapper, // contenedor que contiene el marcador y su texto
        //                         mark: style.mark, // punto en la pista que indica un separador
        //                         markLabel: style.markLabel, // texto que acompaña al marcador

        //                         // MANEJADORES
        //                         thumb: style.thumb, // Manejadores que arrastrar para definir el rango
        //                         label: `nunito-semibold ${style.label}`, // texto que acompaña al rango
        //                     }}
        //                     min={100}
        //                     max={1000}
        //                 />
        //                 <div
        //                     style={{
        //                         width: "100%",
        //                         display: "flex",
        //                         flexDirection: "row",
        //                     }}
        //                 >
        //                     <Text className={style.labelTextInput}> Min</Text>
        //                     <Text className={style.labelTextInput}> Max</Text>
        //                 </div>
        //                 <div
        //                     style={{
        //                         display: "flex",
        //                         flexDirection: "row",
        //                         alignItems: "center",
        //                         justifyContent: "space-around",
        //                         gap: "0.5rem"
        //                     }}
        //                 >
        //                     <NumericInput
        //                         value={values[0]}
        //                         onChange={(e) => setValues([Number(e), values[1]])}
        //                         className={style.numericInput}
        //                         classNameInput={style.inputContainerNumericInput}
        //                     />
        //                     <Divider className={style.divider} size="xs" color="gray" />
        //                     <NumericInput
        //                         value={values[1]}
        //                         onChange={(e) => setValues([values[0], Number(e)])}
        //                         className={style.numericInput}
        //                         classNameInput={style.inputContainerNumericInput}
        //                     />
        //                 </div>
        //             </div>
        //         </div>
        //     </div>
        //     {/* <RangeSlicerMantineTable 
        //         max={1000}
        //         min={100}
        //         size="sm"
        //         radius="md"
        //         value={rangeNumber}
        //         onChange={handleOnChange}
        //     /> */}
        // </div>
    );
};

export default NotFound;
