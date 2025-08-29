import {
    Link
} from "react-router-dom";
import StyleModule
    from "./slidebar.module.css";
import {
    useState
} from "react";
import type {
    ReactNode
} from "react";

interface IProps {
    className?: string
    options: {
        label: string,
        icon: ReactNode,
        path: string
    }[],
    sectionCollapsed?: ReactNode,
}

const AsideBar = ({
    className,
    options,
    sectionCollapsed,
}: IProps) => {

    const [isCollapsed, setIsCollapsed] =
        useState(true);

    return (
        <>
            <nav
                className={[
                    className,
                    StyleModule.slidebar,
                    isCollapsed
                        ? StyleModule.collapsed
                        : StyleModule.expanded,
                ].join(' ')}
            >
                {options.map((option) => (
                    <Link
                        className={StyleModule.navLink}
                        to={option.path}
                    >
                        {
                            <section className={StyleModule.sectionCollapsed}
                             onClick={() => setIsCollapsed(!isCollapsed)}>
                                {isCollapsed && sectionCollapsed}
                            </section>
                        }
                        <section>

                        </section>
                        <section className={StyleModule.navItem}>
                            <div
                                className={StyleModule.iconItem}
                            >{option.icon}</div>
                            <span
                                className={StyleModule.labelItem}
                            >{option.label}</span>
                        </section>
                        <section>

                        </section>
                    </Link>
                ))}
            </nav >
        </>
    );
}

export default AsideBar;