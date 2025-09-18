import { Progress } from "@mantine/core";
import StyleModule from "./SingleProgressBarMantine.module.css";

type Status = "completed" | "inProgress" | "pending";
const statusVar = (s: Status) =>
    s === "completed"
        ? "var(--color-theme-success)"
        : s === "inProgress"
            ? "var(--color-theme-warning)"
            : "var(--color-theme-neutral-background)";

export default function SingleProgressBar({
    value,
    total,
    showLabel = true,
}: { value: number; total: number; showLabel?: boolean }) {
    const percent = total > 0 ? Math.min(100, Math.max(0, (value / total) * 100)) : 0;
    const status: Status =
        total <= 0 ? "pending" : value >= total ? "completed" : value > 0 ? "inProgress" : "pending";

    return (
        <Progress.Root radius="lg" size="md"
            className={StyleModule.progressBarRoot}
        >
            <Progress.Section
                className={StyleModule.progressBarSection}
                value={percent}
                striped
                animated
                style={{ ["--progress-color" as any]: statusVar(status) }} // clave sencilla
            >
                {showLabel && <Progress.Label className={`${StyleModule.labelProgressBar} ${StyleModule.labelProgressBar}`}>{value}/{total}</Progress.Label>}
            </Progress.Section>
        </Progress.Root>
    );
}
