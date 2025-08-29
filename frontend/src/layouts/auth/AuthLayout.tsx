import StyleModule
    from './AuthLayout.module.css';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={StyleModule.rootContainer}>
            {children}
        </div>
    );
};

export default AuthLayout;
