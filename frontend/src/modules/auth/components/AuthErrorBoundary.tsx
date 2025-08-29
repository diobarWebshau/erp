import {
    Component, type ErrorInfo, type ReactNode
} from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class AuthErrorBoundary
    extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Error en Users:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <h2>Ocurrió un error en el modulo de Auth</h2>
            );
        }
        return this.props.children;
    }
}

export default AuthErrorBoundary;
