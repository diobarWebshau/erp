import {
    useState,
    memo,
    cloneElement,
    isValidElement
} from 'react';
import {
    Link
} from 'react-router-dom';
import stylesModules
    from './MainLayout.module.css';
import {
    Outlet
} from "react-router-dom";
import type {
    ReactElement,
    ReactNode
} from "react";
import {
    Boxes,
    ChartNoAxesCombined,
    FileText,
    Package,
    BellDot,
} from "lucide-react"
import Logo from '../../assets/ShauRP_logo.svg?react';
import ShippingIcon from '../../components/icons/ShippingIcon';
import myImage from '../../assets/user.png';
import {
    ChevronsRight,
    ChevronsLeft
} from "lucide-react";
import {
    useLocation
} from "react-router-dom";

interface MenuItem {
    label: string;
    icon: ReactNode;
    path: string;
}

const menuItems: MenuItem[] = [
    {
        label: "Sales",
        icon: <ChartNoAxesCombined
        />,
        path: "/purchased-orders"
    },
    {
        label: "Inventories",
        icon: <FileText
        />,
        path: "/inventories"
    },
    {
        label: "Production",
        icon: <Boxes
        />,
        path: "/productions"
    },
    {
        label: "Logistics",
        icon: <ShippingIcon
        />,
        path: "/logistics"
    },
    {
        label: "Products",
        icon: <Package
        />,
        path: "/products"
    }

]

const MainLayout = memo(() => {

    const location = useLocation();

    const [isSidebarCollapsed, setIsSidebarCollapsed] =
        useState(true);

    const handleDesktopToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSidebarCollapsed(prev => !prev);
    };

    const containerClassNames = [
        isSidebarCollapsed
            ? stylesModules.gridContainerCollapsed
            : stylesModules.gridContainer,
    ].join(' ');

    return (
        <div className={containerClassNames}>
            <aside className={
                `nunito-medium ${isSidebarCollapsed
                    ? stylesModules.asideCollapsed
                    : stylesModules.aside}`
            }
            >
                <section
                    className={`${stylesModules.desktopOnly}`}
                    onClick={handleDesktopToggle}
                >
                    <Logo className={stylesModules.navLogoIcon} />
                </section>

                <section className={stylesModules.contentText}>
                    <ul className={stylesModules.navList}>

                        {menuItems.map((item, index) => (
                            (() => {
                                const isActive = location.pathname === item.path;
                                const styledIcon =
                                    isValidElement(item.icon) &&
                                    cloneElement(item.icon as ReactElement<any>, {
                                        className: `${isActive ? stylesModules.navItemIconActive : ""} ` +
                                            `${isSidebarCollapsed ? stylesModules.navItemIconCollapsed : stylesModules.navItemIcon}`
                                    });
                                return (
                                    <li className={`
                                        ${stylesModules.navItem}
                                        ${isActive
                                            ? stylesModules.navItemActive
                                            : ''
                                        }
                                    `} key={index}>
                                        <Link to={item.path} className={stylesModules.navLink}>
                                            <label className={isSidebarCollapsed
                                                ? stylesModules.navItemIconCollapsed
                                                : stylesModules.navItemIcon
                                            }>{styledIcon}</label>
                                            <label className={isSidebarCollapsed
                                                ? stylesModules.navItemLabelCollapsed
                                                : stylesModules.navItemLabel
                                            }>{item.label}</label>
                                        </Link>
                                    </li>
                                )
                            })()
                        ))}
                    </ul>
                </section>
                <section
                    className={stylesModules.secondaryContent}>
                </section>
                <section className={`${isSidebarCollapsed
                    ? stylesModules.expandSectionCollapsed
                    : stylesModules.expandSection
                    }`}>
                    <button
                        className={`${isSidebarCollapsed
                            ? stylesModules.iconExpandButtonCollapsed
                            : stylesModules.iconExpandButton}`}
                        onClick={handleDesktopToggle}
                    >
                        {
                            isSidebarCollapsed
                                ? <ChevronsRight className={stylesModules.navItemIcon} />
                                : <ChevronsLeft className={stylesModules.navItemIcon} />
                        }
                    </button>
                </section>
            </aside>

            <header className={stylesModules.header}>
                <section className={stylesModules.headerFeatures}>
                    <section className={stylesModules.headerFunctions}>
                        <button
                        >
                            <BellDot className={stylesModules.headerIcon} />
                        </button>
                    </section>
                    <div
                        className={stylesModules.divider}
                    >
                    </div>
                    <section className={stylesModules.headerInfo}>
                        <div className={stylesModules.userInfo}>
                            <p className={`nunito-bold ${stylesModules.userName}`}>
                                Hola, Roberto Mireles</p>
                            <p className={`nunito-semibold ${stylesModules.userEmail}`}>Project Manager</p>
                        </div>
                        <div className={stylesModules.userImage}>
                            <img src={myImage} alt="" />
                        </div>
                    </section>
                    <div
                        className={stylesModules.mobileOnly}
                        onClick={handleDesktopToggle}
                        aria-label="Abrir Sidebar"
                    >
                        ☰
                    </div>
                </section>
            </header>

            <main className={stylesModules.main}>
                <Outlet />
            </main>
        </div>
    );
});

export default MainLayout;