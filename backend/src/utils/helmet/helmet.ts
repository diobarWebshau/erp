import helmet from "helmet";

// Configuracion del contenido de la politica de seguridad
const CONFIG_CONTENT_SECURITY_POLICY = {
    directives: {
        scriptSrc: ["'self'", "'unsafe-eval'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'self'"],
        childSrc: ["'self'"],
        mediaSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:3000"],
        defaultSrc: ["'self'"],
    },
};

// Configuración de Helmet
const helmetUtil = [
    helmet.contentSecurityPolicy(CONFIG_CONTENT_SECURITY_POLICY),
    helmet.frameguard({ action: 'deny' }),
    helmet.referrerPolicy({ policy: "no-referrer" }),
    helmet.noSniff(),
    helmet.hidePoweredBy(), // desactiva la cabecera
];

export default helmetUtil;
