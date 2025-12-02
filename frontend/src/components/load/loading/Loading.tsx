import { Loader } from "@mantine/core";
import StyleModule from "./Loading.module.css"

const Loading = () => {
    return (
        <div className={StyleModule.containerLoading}>
            <Loader type="oval" color="var(--color-theme-primary)" />
        </div>
    );
}

export default Loading;