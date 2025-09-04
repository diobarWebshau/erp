
import StyleModule from "./ValidationContainer.module.css";

interface IValidationContainer {
    children: React.ReactNode;
    validation: string | null;
}

const ValidationContainer = ({ children, validation }: IValidationContainer) => {
    return (
        <div className={StyleModule.container}>
            {children}
            {validation && (
                <span
                    className={`nunito-semibold ${StyleModule.validationContainer}`}
                >{validation}</span>
            )}
        </div>
    );
}

export default ValidationContainer;
