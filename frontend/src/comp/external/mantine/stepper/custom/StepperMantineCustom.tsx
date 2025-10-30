import StepperMantine from "../base/StepperMantine";
import type { IStepperMantine, IStepperStepMantine } from "../base/StepperMantine";

const StepperMantineCustom = ({
    steps,
    initialStep,
    onStepClick,
    allowNextStepsSelect,
    icon,
    iconPosition,
    progressIcon,
    autoContrast,
    mainColor,
}: IStepperMantine) => {
    return (
        <StepperMantine
            steps={steps}
            initialStep={initialStep}
            onStepClick={onStepClick}
            allowNextStepsSelect={allowNextStepsSelect}
            icon={icon}
            iconPosition={iconPosition}
            progressIcon={progressIcon}
            autoContrast={autoContrast}
            mainColor={mainColor}
        />
    );
};

export default StepperMantineCustom;

export type { IStepperStepMantine };
