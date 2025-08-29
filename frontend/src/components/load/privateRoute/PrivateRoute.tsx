import { Navigate } from "react-router-dom";
import { useEffect, type JSX, useRef } from "react";
import { SessionExpired } from "../../../components/load/expired/SessionExpired.tsx";
import type { RootState, AppDispatchRedux } from "../../../store/store.ts";
import { clearAuth, incrementCount, removeAuth } from "../../../store/indexActions.ts";
import { useDispatch, useSelector } from "react-redux";
import StyleModule from "./private-route.module.css"

type IProps = {
    children: JSX.Element;
};

const PrivateRoute = ({ children }: IProps) => {
    const hasHandledRetry = useRef(false);
    const dispatch: AppDispatchRedux = useDispatch();

    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const username = useSelector((state: RootState) => state.auth.username);
    const retryCount = useSelector((state: RootState) => state.auth.retryCount);


    // Verifica el estado de la sesión si hay un usuario autenticado
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch("http://localhost:3003/authentication/auth", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });

                const data = await response.json();
                if (!data.valid) {
                    console.log("Sesión vencida...");
                    dispatch(removeAuth());
                } else {
                    console.log("Sesión activa...");
                }
            } catch (error) {
                console.error("Error en verificación de sesión:", error);
                dispatch(removeAuth());
            }
        };

        if (isAuthenticated && username) {
            verifyAuth();
        }
    }, [dispatch, isAuthenticated, username]);

    // Lógica para manejar el conteo de reintentos (fuera del render)

    useEffect(() => {
        if (
            !hasHandledRetry.current &&
            isAuthenticated === false &&
            !username &&
            retryCount !== null
        ) {
            hasHandledRetry.current = true; // evitamos múltiples dispatch
            if (retryCount < 3) {
                dispatch(incrementCount());
            } else {
                dispatch(clearAuth());
            }
        }
    }, [dispatch, isAuthenticated, username, retryCount]);


    // Renderizado de rutas según estado de autenticación
    if (isAuthenticated && username && retryCount === null) {
        return children;
    }

    if (isAuthenticated === false && !username && retryCount !== null) {
        if (retryCount < 3) {
            console.log(retryCount);
            return (
                <>
                    <div className={StyleModule.children}>
                        {children}
                    </div>
                    <SessionExpired />
                </>
            );
        } else {
            console.log(retryCount);
            return <Navigate to="/login" replace />;
        }
    }

    return <Navigate to="/login" replace />;
};

export default PrivateRoute;
