import { cloneElement, isValidElement, type JSX } from "react";


const withClassName = <T extends JSX.Element>(
    element: T,
    className: string,
    style?: Record<string, any>
): T => {
    return isValidElement(element)
        ? cloneElement(element, {
            className: `${className} ${element.props.className || ""}`,
            style: { ...(element.props.style || {}), ...(style || {}) }
        }) as T
        : element;
};

export default withClassName;