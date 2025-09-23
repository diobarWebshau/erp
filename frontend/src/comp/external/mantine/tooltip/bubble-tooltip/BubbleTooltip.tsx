import { Tooltip } from "@mantine/core";
import { AlertTriangle } from "lucide-react";
import styles from "./BubbleTooltip.module.css";

interface IBubbleTooltipProps {
    children: React.ReactNode;
    label: string;
}

const BubbleTooltip = ({
    children,
    label
}: IBubbleTooltipProps) => {
    return (
        <Tooltip
            withArrow
            arrowSize={15}
            position="top"
            offset={8}
            withinPortal
            multiline
            classNames={{
                tooltip: styles.tooltip,
                arrow: styles.arrow
            }}
            label={
                <div className={styles.content}>
                    <AlertTriangle className={styles.icon} />
                    <span className={`nunito-medium ${styles.label}`}>{label}</span>
                </div>
            }
        >
            <span className={styles.target}>{children}</span>
        </Tooltip>
    );
}

export default BubbleTooltip;

