import { cloneElement, type JSX } from "react";

const withClassName = <T extends JSX.Element>(
    element: T,
    className: string
): T => {
    return cloneElement(element, {
        className: `${className} ${element.props.className || ""}`,
    }) as T;
}

export default withClassName;