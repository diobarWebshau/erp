import StyleModule from "./GlobalLoading.module.css"

const GlobalLoading = () => (
    <div className={StyleModule.containerLoading}>
        <div className="spinner" />
    </div>
);


export default GlobalLoading;