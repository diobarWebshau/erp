import { Stepper } from "@mantine/core";
import type { MantineTheme, StepperProps } from "@mantine/core";
import type { ReactNode } from "react";
import clsx from "clsx";
import StyleModule from "./StepperMantine.module.css";

interface IStepperStepMantine {
    /* contenido del paso */
    title: string;
    description?: string;
    icon?: ReactNode;
    content: ReactNode | (() => ReactNode);
    /* props del Step */
    props?: {
        loading?: boolean; // válido en Mantine Stepper.Step
    };
    /* apariencia */
    mainColor?: string;
    completedIcon?: ReactNode;
}

interface IStepperMantine {
    /* estado/control */
    steps: IStepperStepMantine[];
    initialStep: number; // índice controlado desde fuera
    /* eventos */
    onStepClick?: (step: number) => void;
    allowNextStepsSelect?: boolean;
    /* iconos */
    icon?: ReactNode;
    iconPosition?: "left" | "right"; // ahora opcional
    progressIcon?: ReactNode;
    /* apariencia */
    autoContrast?: boolean; // prop válida en Mantine (antes autoLoading)
    classNames?: StepperProps["classNames"];
    className?: StepperProps["className"];
    mainColor?: string;
}

const StepperMantine = ({
    steps,
    initialStep,
    onStepClick,
    allowNextStepsSelect = false,
    icon,
    iconPosition = "left",
    progressIcon,
    autoContrast,
    classNames,
    className,
    mainColor
}: IStepperMantine) => {
    const processContent = (content: IStepperStepMantine["content"]) =>
        typeof content === "function" ? content() : content;

    return (
        <Stepper
            {...(mainColor && { color: mainColor })}
            active={initialStep}
            onStepClick={onStepClick}
            allowNextStepsSelect={allowNextStepsSelect}
            className={clsx(StyleModule.root, className)}
            // La prop theme es el tema de Mantine, es el tema que se configura en el provider de Mantine
            // La prop props es el objeto de props del Stepper, es las props que se configuran desde el componente padre
            // La prop ctx es el contexto del Stepper
            classNames={(theme: MantineTheme, props: StepperProps, ctx) => {
                // Normaliza el classNames externo, lo que nos permite acceder directamente a las claves del classNames externo
                // De otra forma, si no hace lo de la normalizacion, no podremos acceder directamente a las claves del classNames externo
                // Esto debido a que este no tiene acceso al provider de Mantine, ni al contexto del Stepper
                const ext =
                    typeof classNames === "function" ? classNames(theme, props, ctx) : (classNames ?? {});

                return {
                    // Conservar TODAS las claves externas
                    ...ext,

                    // Fusionar por clave sin pisar (usa solo las que necesitas)
                    root: clsx(StyleModule.root, ext.root),
                    steps: clsx(StyleModule.steps, ext.steps),
                    content: clsx(StyleModule.content, ext.content),
                };
            }}
            {...(icon && { icon })}
            {...(progressIcon && { progressIcon })}
            {...(autoContrast !== undefined && { autoContrast })}
            {...(iconPosition && { iconPosition })}
        >
            {
                steps.map((step, index) => (
                    <Stepper.Step
                        key={index}
                        {...(step.title ? { label: step.title } : {})}
                        {...(step.description ? { description: step.description } : {})}
                        {...(step.icon ? { icon: step.icon } : {})}
                        {...(step.icon ? { completedIcon: step.icon } : {})}
                        {...(step.props ? { ...step.props } : {})}
                    >
                        {processContent(step.content)}
                    </Stepper.Step>
                ))
            }
        </Stepper >
    );
};

export default StepperMantine;

export type { IStepperStepMantine, IStepperMantine }


// ? CLASES DEL STEPPER
/*
    <Stepper
        classNames={{
            // Contenedor principal
            root: StyleModule.stepperRoot,

            // Contenedor de los steps
            steps: StyleModule.steps,

            // Clases para aplicar estilos en general a los steps
            stepBody: StyleModule.stepBody, // Contenedor del contenido del step
            stepDescription: StyleModule.stepDescription, // Descripcion del step
            stepLabel: StyleModule.stepLabel, // Titulo del step
            stepWrapper: StyleModule.stepWrapper, // Contenedor del icono
            stepIcon: StyleModule.stepIcon, // Icono del step
            stepCompletedIcon: StyleModule.stepCompletedIcon, // Icono del step
            stepLoader: StyleModule.stepLoader, // Icono de carga del Step
            step: StyleModule.step,

            // Area del separador vertical
            verticalSeparator: StyleModule.verticalSeparator, // Separador vertical del Step
            separator: StyleModule.separator,

            // Area del contenido
            content: StyleModule.content, // Contenedor del contenido
        }}
    />

*/

// ? CLASES DEL STEPPER STEP
/*
    <Stepper.Step 
        classNames={{
            
            // Contenedor principal
            step: StyleModule.step,

            // Area del contenido
            stepBody: StyleModule.stepBody, // contenido del step
            stepDescription: StyleModule.stepDescription, // descripcion del step
            stepLabel: StyleModule.stepLabel, // titulo del step

            // Area del icono
            stepWrapper: StyleModule.stepWrapper, // contenedor del icon
            stepIcon: StyleModule.stepIcon, // icono del step
            stepCompletedIcon: StyleModule.stepCompletedIcon, // icono del step
            stepLoader: StyleModule.stepLoader, // icono de carga del Step

            // Area del separador vertical
            verticalSeparator: StyleModule.verticalSeparator, // separador vertical del Step

        }}
    />
*/ 