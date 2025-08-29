import {
    Component,
    type ErrorInfo,
    type ReactNode
} from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class LogisticErrorBoundary
    extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(
            `A rendering error occurred`
            + ` in the Logistic module:`,
            error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <h2>
                    {`A rendering error occurred 
                    in the Logistic module`}
                </h2>
            );
        }
        return this.props.children;
    }
}

export default LogisticErrorBoundary;
