import StyleModule
    from "./Login.module.css";
import {
    useNavigate, type NavigateFunction
} from "react-router-dom";
import { useRef, useState } from "react";
import {
    validateSafeParseAsync
} from "./login.schema.ts"
import {
    useDispatch, useSelector
} from "react-redux";
import { saveAuth } from "../../../../store/slicer/authSlicer.ts"
import type {
    RootState, AppDispatchRedux
} from "../../../../store/store.ts";
import LogoComponent
    from "../../../../components/icons/Logo.tsx";
import FadeButton
    from "../../../../components/ui/table/components/gui/button/fade-button/FadeButton.tsx";
import MicrosoftIcon
    from "../../../../components/icons/MicrosoftiCon.tsx";
import GoogleIcon
    from "../../../../components/icons/GoogleIcon.tsx";
import StandarTextField
    from "../../../../components/ui/table/components/gui/text-field/standar-text-field/StandarTextField.tsx";
import StandarTextFieldPassword
    from "../../../../components/ui/table/components/gui/text-field/standar-text-field-password/StandarTextFieldPassword.tsx";
import type{ PayloadSlice } from "./../../../../store/slicer/authSlicer.ts";

import {
    EyeOff,
    Eye,
    Mail
} from 'lucide-react'

interface LoginData {
    username: string | undefined,
    password: string | undefined
}

const Login = () => {
    const dispatch: AppDispatchRedux = useDispatch();
    const auth = useSelector((state: RootState) => state.auth.username);
    const [username, setUsername] = useState<string | undefined>(
        localStorage.getItem('rememberedUser') ?? ""
    );
    const [password, setPassword] = useState<string | undefined>(
        localStorage.getItem('rememberedPass') ?? ""
    );
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    const navigate: NavigateFunction = useNavigate();

    const loginApp = async (input: LoginData) => {
        try {
            console.log(auth);
            const response = await fetch(
                "http://localhost:3003/authentication/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(input)
            });
            const res = await response.json();
            if (res?.validation) {
                console.log(res);
                return;
            }
            const payload: PayloadSlice = res.message;
            console.log(payload);
            dispatch(saveAuth(payload));
            if (rememberMe && username && password) {
                localStorage.setItem('rememberedUser', username);
                localStorage.setItem('rememberedPass', password);
            }
            navigate("/inventories");
        } catch (error: unknown) {
            if (error instanceof Error)
                console.error(error.message);
            else console.error(error);
        }
    }

    const handleButton = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const inputData: LoginData =
            { username: username, password: password }
        try {
            const validateForm =
                await validateSafeParseAsync({
                    username: username,
                    password: password
                })
            if (validateForm?.error) {
                const error = validateForm.error.errors;
                error.forEach((err) => console.log(err.message));
                return;
            }
            await loginApp(inputData);
        } catch (error: unknown) {
            if (error instanceof Error) console.error(error.message);
            else console.error(error);
        }

    };

    const toggleRememberMe = () => {
        setRememberMe(!rememberMe);
    };

    const handleOnChangeRememberMe = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.checked) {
            setRememberMe(e.target.checked);
        } else {
            setRememberMe(e.target.checked);
        }
    };

    return (
        <>
            <div className={StyleModule.loginContainer}>
                <div className={`nunito-bold ${StyleModule.presentationContainer}`}>
                    <LogoComponent
                        classNameLogo={StyleModule.logoImage}
                    />
                    <h1>Llevando tu negocio al siguiente nivel</h1>
                    <h2>Gestión completa sin complicaciones</h2>
                </div>
                <form className={StyleModule.loginForm}>
                    <div className={StyleModule.loginFormContainer}>
                        <StandarTextField
                            label="Correo electrónico"
                            placeholder="correo@gmail.com"
                            type="email"
                            value={username ?? ""}
                            required
                            disabled={false}
                            autoFocus={true}
                            classNameInput={`nunito-regular ${StyleModule.textFieldInputEmail}`}
                            classNameLabel={`nunito-bold ${StyleModule.textFieldLabelEmail}`}
                            classNameContainer={StyleModule.textFieldContainerEmail}
                            id="username"
                            name="username"
                            icon={<Mail className={StyleModule.textFieldIconEmail} />}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <StandarTextFieldPassword
                            label="Contraseña"
                            placeholder="Inserta tu contraseña"
                            value={password ?? ""}
                            required
                            disabled={false}
                            autoFocus={true}
                            classNameInput={`nunito-regular ${StyleModule.textFieldInputPassword}`}
                            classNameLabel={`nunito-bold ${StyleModule.textFieldLabelPassword}`}
                            classNameContainer={StyleModule.textFieldContainerPassword}
                            id="password"
                            name="password"
                            classNameEyeIcon={StyleModule.textFieldIconEye}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <FadeButton
                            onClick={handleButton}
                            classNameButton={StyleModule.fadeButtonSignIn}
                            classNameSpan={StyleModule.fadeButtonSpanSignIn}
                            classNameLabel={`nunito-bold ${StyleModule.fadeButtonLabelSignIn}`}
                            typeOrderIcon="first"
                            label="Iniciar sesión"
                            type="button"
                        />
                        <div className={StyleModule.containerOptionsPassword}>
                            <div className={StyleModule.containerRememberCheckbox}>
                                <input
                                    type="checkbox"
                                    onChange={handleOnChangeRememberMe}
                                    checked={rememberMe}
                                    className={StyleModule.rememberCheckbox}
                                />
                                <span
                                    className={`nunito-semibold ${StyleModule.spanRememberMe}`}
                                    onClick={toggleRememberMe}
                                >
                                    Recordar contraseña
                                </span>
                            </div>
                            <span className={`nunito-semibold ${StyleModule.spanForgotPassword}`}>
                                ¿Olvidaste tu contraseña?
                            </span>
                        </div>
                        <div className={StyleModule.containerButtons}>
                            <FadeButton
                                icon={<GoogleIcon classNameIcon={StyleModule.fadeButtonIconGoogle} />}
                                classNameButton={StyleModule.fadeButtonGoogle}
                                classNameSpan={StyleModule.fadeButtonSpanGoogle}
                                classNameLabel={`nunito-medium ${StyleModule.fadeButtonLabelGoogle}`}
                                typeOrderIcon="first"
                                label="Iniciar sesión con Google"
                                type="button"
                            />
                            <FadeButton
                                icon={<MicrosoftIcon classNameIcon={StyleModule.fadeButtonIconMicrosoft} />}
                                classNameButton={StyleModule.fadeButtonMicrosoft}
                                classNameSpan={StyleModule.fadeButtonSpanMicrosoft}
                                classNameLabel={`nunito-medium ${StyleModule.fadeButtonLabelMicrosoft}`}
                                typeOrderIcon="first"
                                label="Iniciar sesión con Microsoft"
                                type="button"
                            />
                        </div>
                    </div>

                </form>
            </div>
        </>
    );
}

export default Login;