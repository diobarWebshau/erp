import { Progress } from "@mantine/core";
import StyleModule from "./SingleProgressBarMantine.module.css";


interface PropsSingleProgressBarMantine {
    value: number;
    total: number;
    showLabel?: boolean;
    classNameRoot?: string;
    classNameSection?: string;
    classNameLabel?: string;
}

type Status = "completed" | "inProgress" | "pending";
const statusVar = (s: Status) =>
    s === "completed"
        ? "var(--color-success)"
        : s === "inProgress"
            ? "var(--color-warning)"
            : "var(--color-theme-background)";

const SingleProgressBarMantine = ({
    value,
    total,
    showLabel = true,
    classNameRoot,
    classNameSection,
    classNameLabel
}: PropsSingleProgressBarMantine) => {
    
    const percent = total > 0
        ? Math.min(100, Math.max(0, (value / total) * 100))
        : 0;
    
    const status: Status =
        total <= 0
            ? "pending"
            : value >= total
                ? "completed"
                : value > 0
                    ? "inProgress"
                    : "pending";

    return (
        <Progress.Root
            className={`${StyleModule.progressBarRoot} ${classNameRoot}`}
        >
            <Progress.Section
                className={`${StyleModule.progressBarSection} ${classNameSection}`}
                value={percent}
                animated
                color={statusVar(status)}
            />
            {
                showLabel &&
                <Progress.Label
                    className={`${StyleModule.labelProgressBar} ${classNameLabel}`}>
                    {value}/{total}
                </Progress.Label>
            }
        </Progress.Root>
    );
}


export default SingleProgressBarMantine;
