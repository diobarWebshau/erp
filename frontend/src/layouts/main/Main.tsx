import { BookText, Boxes, ChartNoAxesCombined, ChevronDown, ChevronsLeft, ChevronsRight, ChevronUp, FileText, MapPinned, Package, Settings, UserPen } from "lucide-react";
import { memo, useState, type ReactElement, type ReactNode } from "react";
import ShippingIcon from "../../components/icons/ShippingIcon";
import { Link, useLocation } from "react-router-dom";
import withClassName from "../../utils/withClassName";
import stylesModules from "./Main.module.css";
import LogoComponent from "../../components/icons/Logo";
import ProductionLineIcon from "../../components/icons/ProductionLineIcon";

interface MenuItem {
    label: string;
    icon: ReactNode;
    path: string;
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        label: "Ventas",
        icon: <ChartNoAxesCombined />,
        path: "/purchased-orders"
    },
    {
        label: "Inventario",
        icon: <FileText />,
        path: "/inventories"
    },
    {
        label: "Producción",
        icon: <Boxes />,
        path: "/productions"
    },
    {
        label: "Logística",
        icon: <ShippingIcon />,
        path: "/logistics"
    },
    {
        label: "Catálogo",
        icon: <BookText />,
        path: "#",
        children: [
            {
                label: "Producto",
                icon: <Package />,
                path: "/products"
            },
            {
                label: "Ubicación",
                icon: <MapPinned />,
                path: "/locations"
            },
            {
                label: "Cliente",
                icon: <UserPen />,
                path: "/clients"
            },
            {
                label: "Linea de producción",
                icon: <Package />,
                path: "/production_lines"
            },
        ]
    }

]

const MenuExtra = [
    {
        label: "Configuración",
        icon: <Settings />,
        path: "/settings"
    },
]

const MainLayout = () => {

    const location = useLocation();

    const [isSidebarCollapsed, setIsSidebarCollapsed] =
        useState(true);

    const handleDesktopToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSidebarCollapsed(prev => !prev);
    };

    interface NavItemDropdownProps {
        isActive: boolean;
        parent: MenuItem;
        iconWithClassParent: ReactElement;
    }

    const NavItemDropdown = memo(({
        isActive,
        parent,
        iconWithClassParent
    }: NavItemDropdownProps) => {

        const [isExpanded, setIsExpanded] = useState(false);

        const toggleExpand = () => {
            setIsExpanded(!isExpanded);
        };

        return (
            <li
                key={parent.label}
                className={
                    `${stylesModules.navItemDropdown} ` +
                    `${isExpanded ? stylesModules.navItemDropdownIsExpanded : ""} ` +
                    `${!isActive && !isExpanded ? stylesModules.navItemDropdownIsNotActive : ""}`
                }
                onClick={toggleExpand}
            >
                <div
                    className={` ${isSidebarCollapsed ? stylesModules.wrapperItemDropdownCollapsed : stylesModules.wrapperItemDropdown} `}
                >
                    <div className={stylesModules.navItemContent}>
                        <label
                            className={stylesModules.navItemIcon
                            }
                        >
                            {iconWithClassParent}
                        </label>
                        <label
                            className={isSidebarCollapsed
                                ? stylesModules.navItemLabelCollapsed
                                : stylesModules.navItemLabel
                            }
                        >
                            {parent.label}
                        </label>
                    </div>
                    <div
                        className={
                            isSidebarCollapsed ? stylesModules.iconNavItemDropdownContainerCollapsed : stylesModules.iconNavItemDropdownContainer
                        }
                    >
                        {
                            isExpanded ? (
                                <ChevronUp className={stylesModules.iconDropdownItem} />
                            ) : (
                                <ChevronDown className={stylesModules.iconDropdownItem} />
                            )
                        }
                    </div>
                </div>
                {
                    isExpanded && (
                        <div
                            className={`${isSidebarCollapsed ? stylesModules.navListChildrenDropdownCollapsed : stylesModules.navListChildrenDropdown}`}
                        >
                            {
                                parent.children?.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    const iconWithClassChildren = withClassName(item.icon as ReactElement, `${isActive ? stylesModules.navItemIconActive : ""} ` +
                                        `${isSidebarCollapsed ? stylesModules.navItemIconCollapsed : stylesModules.navItemIcon} `);
                                    return (
                                        <Link
                                            to={item.path}
                                            key={item.label}
                                            className={
                                                `${stylesModules.navItem} ` +
                                                `${isActive ? stylesModules.navItemActive : ''}`
                                            }
                                        >
                                            <div className={stylesModules.navLink}>
                                                <label className={stylesModules.navItemIcon}>
                                                    {iconWithClassChildren}
                                                </label>
                                                <label className={isSidebarCollapsed
                                                    ? stylesModules.navItemLabelCollapsed
                                                    : stylesModules.navItemLabel
                                                }>{item.label}</label>
                                            </div>
                                        </Link>
                                    );
                                })
                            }
                        </div>
                    )
                }
            </li>
        )
    });

    interface NavItemExtraProps {
        parent: MenuItem;
        iconWithClassParent: ReactElement;
    }

    const NavItemExtra = ({
        parent,
        iconWithClassParent
    }: NavItemExtraProps) => {

        const isActive = location.pathname === parent.path;

        return (
            <Link
                to={parent.path}
                key={parent.label}
                className={
                    `${isSidebarCollapsed ? stylesModules.navItemCollapsed : stylesModules.navItem} ` +
                    `${isActive ? stylesModules.navItemActive : ''}`
                }
            >
                <div className={stylesModules.navLink}>
                    <label className={isSidebarCollapsed
                        ? stylesModules.navItemIconCollapsed
                        : stylesModules.navItemIcon
                    }>{iconWithClassParent}</label>
                    <label className={isSidebarCollapsed
                        ? stylesModules.navItemLabelCollapsed
                        : stylesModules.navItemLabel
                    }>{parent.label}</label>
                </div>
            </Link>
        )

    }


    interface NavItemProps {
        isActive: boolean;
        parent: MenuItem;
        iconWithClassParent: ReactElement;
    }

    const NavItem = ({
        isActive,
        parent,
        iconWithClassParent
    }: NavItemProps) => {
        return (
            <Link
                to={parent.path}
                key={parent.label}
                className={
                    `${stylesModules.navItem} ` +
                    `${isActive ? stylesModules.navItemActive : ''}`
                }
            >
                <div className={stylesModules.navLink}>
                    <label className={stylesModules.navItemIcon}>
                        {iconWithClassParent}
                    </label>
                    <label className={isSidebarCollapsed
                        ? stylesModules.navItemLabelCollapsed
                        : stylesModules.navItemLabel
                    }>{parent.label}</label>
                </div>
            </Link>
        )

    }

    function Sidebar({ collapsed }: { collapsed: boolean }) {
        return (
            <div className={stylesModules.layoutTest}>
                <aside className={stylesModules.asideTest} data-collapsed={collapsed}>
                    <a className={stylesModules.itemTest} href="#">
                        <span className={stylesModules.iconTest}>🏠</span>
                        <span className={stylesModules.labelTest} aria-hidden={collapsed}>Dashboard</span>
                    </a>
                    <a className={stylesModules.itemTest} href="#">
                        <span className={stylesModules.iconTest}>📈</span>
                        <span className={stylesModules.labelTest} aria-hidden={collapsed}>Analytics</span>
                    </a>
                </aside>
                <main className={stylesModules.mainTest}>Contenido</main>
            </div>
        );
    }

    const NavItemRenderer = memo((children: MenuItem) => {
        const isActive = location.pathname === children.path;
        const iconWithClassParent = withClassName(children.icon as ReactElement, `${isActive ? stylesModules.navItemIconActive : ""} ` +
            `${isSidebarCollapsed ? stylesModules.navItemIconCollapsed : stylesModules.navItemIcon} `);

        if (children?.children?.length && children?.children.length > 0) {
            return (
                <NavItemDropdown
                    isActive={isActive}
                    parent={children}
                    iconWithClassParent={iconWithClassParent}
                />
            );
        } else {
            return (
                <NavItem
                    isActive={isActive}
                    parent={children}
                    iconWithClassParent={iconWithClassParent}
                />
            );
        }
    })



    return (
        <div
            className={
                `${isSidebarCollapsed
                    ? stylesModules.gridContainerCollapsed
                    : stylesModules.gridContainer
                }`
            }
        >
            <aside
                className={
                    `nunito-medium ${isSidebarCollapsed
                        ? stylesModules.asideCollapsed
                        : stylesModules.aside}`
                }
            >

                <div
                    className={`${stylesModules.desktopOnly} `}
                    onClick={handleDesktopToggle}
                >
                    <LogoComponent classNameLogo={stylesModules.navLogoIcon} />
                </div>

                <div className={stylesModules.contentNav}>
                    <div className={stylesModules.navList}>
                        {
                            menuItems.map((item, index) => (
                                <NavItemRenderer key={index} {...item} />
                            ))
                        }
                    </div>
                </div>
                <div className={`${isSidebarCollapsed
                    ? stylesModules.footerSectionCollapsed
                    : stylesModules.footerSection
                    } `}>
                    {
                        MenuExtra.map((item, index) => (
                            <NavItemExtra key={index} {...item} parent={item} iconWithClassParent={item.icon} />
                        ))
                    }
                    <div className={stylesModules.iconExpandButtonContainer}>
                        <button
                            className={`${isSidebarCollapsed
                                ? stylesModules.expandButtonCollapsed
                                : stylesModules.expandButton
                                } `}
                            onClick={handleDesktopToggle}
                        >
                            {
                                isSidebarCollapsed
                                    ? <ChevronsRight className={stylesModules.iconCoollapsedAside} />
                                    : <ChevronsLeft className={stylesModules.iconCoollapsedAside} />
                            }
                        </button>
                    </div>
                </div>

            </aside>

            <header
                className={stylesModules.header}
            >
                <h1>Header</h1>
            </header>


            <main
                className={stylesModules.main}
            >
                <Sidebar collapsed={isSidebarCollapsed} />
            </main>


        </div>
    )
};

export default MainLayout;