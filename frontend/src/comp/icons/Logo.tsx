/*
    Para que el proyecto en vite procese los .svg como componentes React (SVGR)
    y typescript interprete correctamente la exportacion del svg como ReactComponent
    se debe agregar la siguiente plugin "vite-plugin-svgr" dentro de la instancia de configuracion 
    de vite en el archivo de vite.config.ts 

    1. Importacion

        import { ReactComponent as Logo } from '../../assets/ShauRP_logo.svg';

    2. Configuracion en vite.config.ts

        import svgr from 'vite-plugin-svgr';

        export default defineConfig({
        plugins: [
            react(),
            svgr(), // habilita importación como componente
        ],
        });

    3. utilizacion del svg como componente

        import ReactComponent as Logo from '../../assets/ShauRP_logo.svg?react';


*/

/*

    si no quieres usar vite-plugin-svgr ni importar SVG como componente React, la forma estándar 
    (y universal) de usar un SVG en React con TypeScript es importarlo como URL y usarlo en una
     etiqueta <img>.

     Cómo hacerlo sin vite-plugin-svgr
        1. Declara los tipos para importar SVG como URL
        Crea un archivo (si no tienes uno) para declarar módulos SVG en TypeScript:

        src/types/svg-url.d.ts

            declare module '*.svg' {
                const content: string;
                export default content;
            }

        2. Importa el SVG como URL

            import logoUrl from '../../assets/ShauRP_logo.svg';

            const MyComponent = () => {
            return <img src={logoUrl} alt="Logo" width={100} height={100} />;
            };


        3. Ventajas y limitaciones
            Aspecto	Usando solo URL (<img>)	Usando componente SVG (vite-plugin-svgr)
            Fácil y universal	✅	✅
            Puedes cambiar color desde React	❌ (tendrías que usar filtros CSS)	✅ (puedes pasar props fill, etc.)
            Controlar animaciones con CSS	Limitado	Mejor control
            Accesibilidad y SEO	✅	✅

        4. Resumen
            Sin plugins, importa SVG como archivo, úsalo como URL en <img>.

            Define el tipo para que TypeScript no se queje.

            Ideal para imágenes estáticas sin interacción dinámica.

*/


import Logo from '../../assets/ShauRP_logo.svg?react';

interface LogoProps {
    classNameLogo?: string
}

const LogoComponent = ({
    classNameLogo
}: LogoProps) => {
    return (
        <Logo className={classNameLogo} />
    );
};

export default LogoComponent;

