import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import stylesModules from "./AsideBarCustom.module.css";
import { ChevronDown, ChevronsLeft, ChevronsRight, ChevronUp } from "lucide-react";
import LogoComponent from "../../../../components/icons/Logo";
import type { ReactElement, ReactNode } from "react";
import withClassName from "../../../../utils/withClassName";

interface MenuItem {
    label: string;
    icon: ReactNode;
    path: string;
    children?: MenuItem[];
    classNameAsideCollapsed?: string;
    classNameAsideExpanded?: string;
}

interface AsideBarCustomProps {
    menuItems: MenuItem[];
    extraItems?: MenuItem[];
    classNameAsideCollapsed?: string;
    classNameAsideExpanded?: string;
}

const AsideBarCustom = ({
    menuItems,
    extraItems,
    classNameAsideCollapsed,
    classNameAsideExpanded
}: AsideBarCustomProps) => {

    const [isAsideBarCollapsed, setIsAsideBarCollapsed] = useState(true);

    const handleDesktopToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAsideBarCollapsed(prev => !prev);
    };

    const NavItemRenderer = memo((children: MenuItem) => {
        const location = useLocation();
        const isActive = location.pathname === children.path;
        const iconWithClassParent = withClassName(children.icon as ReactElement, `${isActive ? stylesModules.navItemIconActive : ""} ` +
            `${isAsideBarCollapsed ? stylesModules.navItemIconCollapsed : stylesModules.navItemIcon} `);

        if (children?.children?.length && children?.children.length > 0) {
            return (
                <NavItemDropdown
                    isActive={isActive}
                    parent={children}
                    iconWithClassParent={iconWithClassParent}
                    isAsideBarCollapsed={isAsideBarCollapsed}
                />
            );
        } else {
            return (
                <NavItem
                    isActive={isActive}
                    parent={children}
                    iconWithClassParent={iconWithClassParent}
                    isAsideBarCollapsed={isAsideBarCollapsed}
                />
            );
        }
    })

    return (
        <aside
            className={
                ` ${isAsideBarCollapsed ? stylesModules.asideCollapsed : stylesModules.aside}` +
                ` ${isAsideBarCollapsed ? classNameAsideCollapsed : classNameAsideExpanded}`
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
                            <NavItemRenderer
                                key={index}
                                {...item}
                            />
                        ))
                    }
                </div>
            </div>
            <div className={`${isAsideBarCollapsed
                ? stylesModules.footerSectionCollapsed
                : stylesModules.footerSection
                } `}>
                {
                    extraItems?.map((item, index) => (
                        <NavItemExtra
                            key={index}
                            {...item}
                            parent={item}
                            iconWithClassParent={item.icon}
                            isAsideBarCollapsed={isAsideBarCollapsed}
                        />
                    ))
                }
                <div
                    className={
                        `${isAsideBarCollapsed
                            ? stylesModules.iconExpandButtonContainerCollapsed
                            : stylesModules.iconExpandButtonContainer
                        }`
                    }
                >
                    <button
                        className={`${isAsideBarCollapsed
                            ? stylesModules.expandButtonCollapsed
                            : stylesModules.expandButton
                            } `}
                        onClick={handleDesktopToggle}
                    >
                        {
                            isAsideBarCollapsed
                                ? <ChevronsRight className={stylesModules.iconCoollapsedAside} />
                                : <ChevronsLeft className={stylesModules.iconCoollapsedAside} />
                        }
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default AsideBarCustom;

// ******* Componente NavItem ********

interface NavItemProps {
    isActive: boolean,
    parent: MenuItem,
    iconWithClassParent: ReactElement,
    isAsideBarCollapsed: boolean,
}

const NavItem = ({
    isActive,
    parent,
    iconWithClassParent,
    isAsideBarCollapsed
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
                <label className={isAsideBarCollapsed
                    ? stylesModules.navItemLabelCollapsed
                    : stylesModules.navItemLabel
                }>{parent.label}</label>
            </div>
        </Link>
    )

}

// ******* Componente NavItemExtra ********

interface NavItemExtraProps {
    parent: MenuItem;
    iconWithClassParent: ReactNode;
    isAsideBarCollapsed: boolean;
}

const NavItemExtra = memo(({
    parent,
    iconWithClassParent,
    isAsideBarCollapsed
}: NavItemExtraProps) => {

    const location = useLocation();
    const isActive = location.pathname === parent.path;

    return (
        <Link
            to={parent.path}
            key={parent.label}
            className={
                `${isAsideBarCollapsed ? stylesModules.navItemCollapsed : stylesModules.navItem} ` +
                `${isActive ? stylesModules.navItemActive : ''}`
            }
        >
            <div className={stylesModules.navLink}>
                <label
                    className={isAsideBarCollapsed ? stylesModules.navItemIconCollapsed : stylesModules.navItemIcon}
                >
                    {iconWithClassParent}
                </label>
                <label className={isAsideBarCollapsed
                    ? stylesModules.navItemLabelCollapsed
                    : stylesModules.navItemLabel
                }>{parent.label}</label>
            </div>
        </Link>
    )
});

// ******* Componente NavItemDropdown ********

interface NavItemDropdownProps {
    isActive: boolean,
    parent: MenuItem,
    iconWithClassParent: ReactElement,
    isAsideBarCollapsed: boolean;
}

const NavItemDropdown = memo(({
    isActive,
    parent,
    iconWithClassParent,
    isAsideBarCollapsed
}: NavItemDropdownProps) => {

    const internalLocation = useLocation();

    const [isExpanded, setIsExpanded] = useState(
        parent.children?.some((item) => item.path === internalLocation.pathname) ?? false
    );

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
                className={` ${isAsideBarCollapsed ? stylesModules.wrapperItemDropdownCollapsed : stylesModules.wrapperItemDropdown} `}
            >
                <div className={stylesModules.navItemContent}>
                    <label
                        className={stylesModules.navItemIcon
                        }
                    >
                        {iconWithClassParent}
                    </label>
                    <label
                        className={isAsideBarCollapsed
                            ? stylesModules.navItemLabelCollapsed
                            : stylesModules.navItemLabel
                        }
                    >
                        {parent.label}
                    </label>
                </div>
                <div
                    className={
                        isAsideBarCollapsed ? stylesModules.iconNavItemDropdownContainerCollapsed : stylesModules.iconNavItemDropdownContainer
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
                        className={`${isAsideBarCollapsed ? stylesModules.navListChildrenDropdownCollapsed : stylesModules.navListChildrenDropdown}`}
                    >
                        {
                            parent.children?.map((item) => {
                                const isActive = location.pathname === item.path;
                                const iconWithClassChildren = withClassName(item.icon as ReactElement, `${isActive ? stylesModules.navItemIconActive : ""} ` +
                                    `${isAsideBarCollapsed ? stylesModules.navItemIconCollapsed : stylesModules.navItemIcon} `);
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
                                            <label className={isAsideBarCollapsed
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