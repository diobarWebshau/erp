import { useNavigate, type NavigateFunction } from "react-router-dom";
import type { AppDispatchRedux } from "../../../store/store.tsx";
import { useDispatch } from "react-redux";
import { removeAuth } from "../../../store/slicer/authSlicer";
import StyleModules from "./sesion-expired.module.css";

const SessionExpired = () => {
    const navigate: NavigateFunction = useNavigate();
    const dispatch: AppDispatchRedux = useDispatch();

    const redirectToHome = () => {
        dispatch(removeAuth());
        navigate("/login");
    };

    return (
        <div className={StyleModules.overlay} aria-live="assertive">
            <div className={StyleModules.container}>
                <h2>Tu sesión ha expirado</h2>
                <p>Por favor, inicia sesión nuevamente.</p>
                <button
                    onClick={redirectToHome}
                    className={StyleModules.button}
                    aria-label="Ir al inicio de la página"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export { SessionExpired };
