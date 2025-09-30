import { cloneElement, isValidElement, type JSX } from "react";

const withClassName = <T extends JSX.Element>(
    element: T,
    className: string
): T => {
    return isValidElement(element) ? cloneElement(element, {
        className: `${className} ${element.props.className || ""}`,
    }) as T : element;
}

export default withClassName;