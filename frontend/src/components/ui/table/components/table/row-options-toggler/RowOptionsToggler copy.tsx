import StyleModule from "./row-options-toggler.module.css";
import type { WrappedRowAction } from "./../../../types";

interface IRowOptionsTogglerProps {
    ref: React.RefObject<HTMLDivElement | null>;
    className?: string;
    actions: WrappedRowAction[];
}

const RowOptionsToggler = ({
    ref,
    className,
    actions,
}: IRowOptionsTogglerProps) => {
    return (
        <div
            ref={ref}
            className={`${StyleModule.options} ${className || ""}`}
        >
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    onClick={(e) => {
                        e.preventDefault();
                        action.onClick();
                    }}
                    disabled={action.disabled ? action.disabled() : false}
                    aria-label={action.label}
                    title={action.label}
                    style={{
                        justifyContent: "center"
                    }}
                >
                    <div>
                        {action.label} {action.icon}
                    </div>
                </button>
            ))}
        </div>
    );
};

export default RowOptionsToggler;
