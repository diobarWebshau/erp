import { Bell, BookText, Boxes, ChartNoAxesCombined, ChevronDown, ChevronsLeft, ChevronsRight, ChevronUp, ClockAlert, FileBadge, FileText, FileWarning, LogOut, MapPinned, Package, Settings, User, UserPen } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactElement, type ReactNode } from "react";
import ShippingIcon from "../../components/icons/ShippingIcon";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import withClassName from "../../utils/withClassName";
import stylesModules from "./MainLayout.module.css";
import LogoComponent from "../../components/icons/Logo";
import ProductionLineIcon from "../../components/icons/ProductionLineIcon";
import { Divider } from "@mantine/core";
import PopoverFloating from "../../comp/external/floating/pop-over/PopoverFloating";
import { Indicator } from "@mantine/core";
import ProfileIcon from "../../components/icons/ProfileIcon";
import { useDispatch, useSelector } from "react-redux";
import { removeAuth } from "../../store/indexActions";
import type { RootState } from "../../store/store";
import clsx from "clsx";

interface MenuItem {
    label: string;
    icon: ReactNode;
    path: string;
    children?: MenuItem[];
}

interface Notification {
    icon: ReactElement,
    onClick?: () => void,
    title: string,
    description: string,
    type: string,
    isRead: boolean
}

const MenuExtra = [
    {
        label: "Configuración",
        icon: <Settings />,
        path: "/settings"
    },
]

const notifications: Notification[] = [
    {
        icon: <ClockAlert />,
        title: "Notificación 1",
        description: "Descripción de la notificación 1, debido a que paso un problema en produccion por cuestiones de falta de inventario y problemas con los operadores y a su vez un camión se bolco.",
        type: "alert",
        isRead: false
    },
    {
        icon: <FileWarning />,
        title: "Notificación 2",
        description: "Descripción de la notificación 2, debido a que paso un problema en produccion por cuestiones de falta de inventario y problemas con los operadores y a su vez un camión se bolco.",
        type: "warning",
        isRead: false
    },
    {
        icon: <FileBadge />,
        title: "Notificación 3",
        description: "Descripción de la notificación 3",
        type: "info",
        isRead: true
    },
    {
        icon: <ClockAlert />,
        title: "Notificación 4",
        description: "Descripción de la notificación 4",
        type: "alert",
        isRead: true
    },
    {
        icon: <FileWarning />,
        title: "Notificación 5",
        description: "Descripción de la notificación 5",
        type: "warning",
        isRead: true
    },
    {
        icon: <FileBadge />,
        title: "Notificación 6",
        description: "Descripción de la notificación 6",
        type: "info",
        isRead: true
    },
    {
        icon: <ClockAlert />,
        title: "Notificación 7",
        description: "Descripción de la notificación 7",
        type: "alert",
        isRead: true
    },
    {
        icon: <FileWarning />,
        title: "Notificación 8",
        description: "Descripción de la notificación 8",
        type: "warning",
        isRead: true
    },
    {
        icon: <FileBadge />,
        title: "Notificación 9",
        description: "Descripción de la notificación 9",
        type: "info",
        isRead: true
    },
    {
        icon: <ClockAlert />,
        title: "Notificación 10",
        description: "Descripción de la notificación 10",
        type: "alert",
        isRead: true
    },
    {
        icon: <FileWarning />,
        title: "Notificación 11",
        description: "Descripción de la notificación 11",
        type: "warning",
        isRead: true
    },
    {
        icon: <FileBadge />,
        title: "Notificación 12",
        description: "Descripción de la notificación 12",
        type: "info",
        isRead: true
    }
]

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
                label: "Linea de producción",
                icon: <ProductionLineIcon />,
                path: "/production-lines"
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
            }
        ]
    }

]


// ***************      ITEM DEL NAV     *************** 

interface NavItemProps {
    isActive: boolean;
    parent: MenuItem;
    iconWithClassParent: ReactElement;
    isSidebarCollapsed: boolean;
}

const NavItem = memo(({
    isActive,
    parent,
    iconWithClassParent,
    isSidebarCollapsed
}: NavItemProps) => {
    const navItemClassNames = clsx(stylesModules.navItem, isActive ? stylesModules.navItemActive : '');
    const navItemLabelClassNames = clsx(isSidebarCollapsed ? stylesModules.navItemLabelCollapsed : stylesModules.navItemLabel)
    return (
        <Link to={parent.path} key={parent.label} className={navItemClassNames}>
            <div className={stylesModules.navLink}>
                <label className={stylesModules.navItemIcon}>{iconWithClassParent}</label>
                <label className={navItemLabelClassNames}>{parent.label}</label>
            </div>
        </Link>
    )
});

// ***************  EXTRA ITEM DEL NAV  *************** 

interface NavItemExtraProps {
    parent: MenuItem;
    iconWithClassParent: ReactElement;
    isSidebarCollapsed: boolean;
}

const NavItemExtra = memo(({
    parent,
    iconWithClassParent,
    isSidebarCollapsed
}: NavItemExtraProps) => {

    const isActive = location.pathname === parent.path;

    const navItemExtraClassName = clsx(isSidebarCollapsed ? stylesModules.navItemCollapsed : stylesModules.navItem, isActive ? stylesModules.navItemActive : '');
    const classNameItemLabel = clsx(isSidebarCollapsed ? stylesModules.navItemLabelCollapsed : stylesModules.navItemLabel);


    return (
        <Link
            to={parent.path}
            key={parent.label}
            className={navItemExtraClassName}
        >
            <div className={stylesModules.navLink}>
                <div className={isSidebarCollapsed
                    ? stylesModules.navItemIconCollapsed
                    : stylesModules.navItemIcon
                }>{iconWithClassParent}</div>
                <label className={classNameItemLabel}>{parent.label}</label>
            </div>
        </Link>
    )

});


// ***************      ITEM DROPDOWN DEL NAV     *************** 

interface NavItemDropdownProps {
    isActive: boolean,
    parent: MenuItem,
    iconWithClassParent: ReactElement,
    isSidebarCollapsed: boolean,
}

const NavItemDropdown = memo(({
    isActive,
    parent,
    iconWithClassParent,
    isSidebarCollapsed
}: NavItemDropdownProps) => {

    const { pathname } = useLocation();

    // 🔥 Se recalcula SIEMPRE que cambie pathname o children
    const hasActiveChild = parent.children?.some(
        (item) => item.path === pathname
    ) ?? false;

    const [isExpanded, setIsExpanded] = useState(hasActiveChild);

    const toggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    // 🔥 Auto expandir si un hijo está activo
    useEffect(() => {
        if (hasActiveChild) {
            setIsExpanded(true);
        }
    }, [hasActiveChild]);

    // 🔥 Clase del item padre
    const navItemDropDownClassName = clsx(
        stylesModules.navItemDropdown,
        isExpanded && stylesModules.navItemDropdownIsExpanded,
        (isActive || hasActiveChild)
            ? stylesModules.navItemDropdownActive
            : stylesModules.navItemDropdownIsNotActive
    );

    const iconDropDown = useMemo(() => {
        return isExpanded
            ? <ChevronUp className={stylesModules.iconDropdownItem} />
            : <ChevronDown className={stylesModules.iconDropdownItem} />
    }, [isExpanded]);

    const classNameWrapperItemDropdown = clsx(
        isSidebarCollapsed
            ? stylesModules.wrapperItemDropdownCollapsed
            : stylesModules.wrapperItemDropdown
    );

    const classNameNavItemLabel = clsx(
        isSidebarCollapsed ? stylesModules.navItemLabelCollapsed : stylesModules.navItemLabel
    );

    const classNameIconNavItemDropdownContainer = clsx(
        isSidebarCollapsed
            ? stylesModules.iconNavItemDropdownContainerCollapsed
            : stylesModules.iconNavItemDropdownContainer
    );

    const classNameNavListChildrenDropdown = clsx(
        isSidebarCollapsed
            ? stylesModules.navListChildrenDropdownCollapsed
            : stylesModules.navListChildrenDropdown
    );

    return (
        <li className={navItemDropDownClassName}>
            <div className={classNameWrapperItemDropdown} onClick={toggleExpand}>
                <div className={stylesModules.navItemContent}>
                    <label className={stylesModules.navItemIcon}>
                        {iconWithClassParent}
                    </label>
                    <label className={classNameNavItemLabel}>
                        {parent.label}
                    </label>
                </div>
                <div className={classNameIconNavItemDropdownContainer}>
                    {iconDropDown}
                </div>
            </div>

            {isExpanded && (
                <div className={classNameNavListChildrenDropdown}>
                    {parent.children?.map((item) => (
                        <NavItemChildren
                            key={item.path}
                            item={item}
                            isSidebarCollapsed={isSidebarCollapsed}
                        />
                    ))}
                </div>
            )}
        </li>
    );
});


interface INavItemChildrenProps {
    item: MenuItem,
    isSidebarCollapsed: boolean
}

const NavItemChildren = memo(({ item, isSidebarCollapsed }: INavItemChildrenProps) => {

    const { pathname } = useLocation();
    const isActive = pathname === item.path;

    const iconWithClassChildren = useMemo(() => {
        return withClassName(
            item.icon as ReactElement,
            clsx(
                isActive ? stylesModules.navItemIconActive : "",
                isSidebarCollapsed ? stylesModules.navItemIconCollapsed : stylesModules.navItemIcon
            )
        );
    }, [isActive, isSidebarCollapsed, item.icon]);

    const classNameItemLabel = clsx(
        isSidebarCollapsed ? stylesModules.navItemLabelCollapsed : stylesModules.navItemLabel
    );

    const classNameNavItem = clsx(
        stylesModules.navItem,
        isActive ? stylesModules.navItemActive : ''
    );

    return (
        <Link to={item.path} className={classNameNavItem}>
            <div className={stylesModules.navLink}>
                <label className={stylesModules.navItemIcon}>{iconWithClassChildren}</label>
                <label className={classNameItemLabel}>{item.label}</label>
            </div>
        </Link>
    );
});


// ***************      ITEM NOTIFICATION     *************** 



interface ItemNotificationProps {
    icon: ReactElement,
    onClick?: () => void,
    title: string,
    description: string,
    type: string
    isRead: boolean
}

const ItemNotification = memo(({
    icon,
    onClick,
    title,
    description,
    type,
    isRead
}: ItemNotificationProps) => {

    const iconWithClass = withClassName(icon, `${type === "alert"
        ? stylesModules.iconNotificationAlert
        : type === "warning"
            ? stylesModules.iconNotificationWarning
            : stylesModules.iconNotificationInfo
        } `
    );
    return (
        <div
            className={
                `${stylesModules.itemNotificationContainer} ` +
                `${isRead
                    ? stylesModules.itemNotificationContainerRead
                    : stylesModules.itemNotificationContainerNotRead
                } `
            }
            onClick={onClick}
        >
            <div className={stylesModules.itemNotificationIconContainer}>
                {
                    type === "alert" ?
                        <div className={stylesModules.itemNotificationIconAlertContainer}>
                            {iconWithClass}
                        </div>
                        : type === "warning" ?
                            <div className={stylesModules.itemNotificationIconWarningContainer}>
                                {iconWithClass}
                            </div>
                            : <div className={stylesModules.itemNotificationIconInfoContainer}>
                                {iconWithClass}
                            </div>
                }
            </div>
            <div className={stylesModules.itemNotificationContent}>
                <span className={`nunito - bold`}>
                    {title}
                </span>
                <p className={`nunito - regular`}>
                    {description}
                </p>
            </div>
        </div>
    );
});


/* ***************      Popover Notifications      *************** */

interface NotificationPopoverProps {
    notifications: Notification[]
}

const NotificationPopover = ({
    notifications
}: NotificationPopoverProps) => {

    const [isExpandPopover, setIsExpandPopover] = useState<boolean>(false);

    const handleExpandPopover = useCallback((e: MouseEvent<HTMLDivElement>) => () => {
        e.stopPropagation();
        setIsExpandPopover(prev => !prev);
    }, []);

    return (
        <div className={`${stylesModules.popoverNotification}   ${isExpandPopover ? stylesModules.popoverNotificationExpand : stylesModules.popoverNotificationNotExpand} `}>
            <div className={stylesModules.popoverHeaderNotification}>
                <span className={`${stylesModules.popoverHeaderNotificationTitle} nunito - bold`}>Notificaciones</span>
                <span className={`${stylesModules.popoverHeaderNotificationLabel} nunito - semibold`}>Marcar como leídas</span>
            </div>
            <div className={`${stylesModules.popoverBodyNotification} ${isExpandPopover ? stylesModules.popoverBodyNotificationExpand : stylesModules.popoverBodyNotificationNotExpand} `}>
                {
                    isExpandPopover ? (notifications.map(
                        (notification) =>
                            <ItemNotification
                                description={notification.description}
                                icon={notification.icon}
                                {...(notification.onClick && { onClick: notification.onClick })}
                                title={notification.title}
                                type={notification.type}
                                isRead={notification.isRead}
                            />
                    )) : (
                        (notifications.slice(0, 4).map(
                            (notification) =>
                                <ItemNotification
                                    description={notification.description}
                                    icon={notification.icon}
                                    {...(notification.onClick && { onClick: notification.onClick })}
                                    title={notification.title}
                                    type={notification.type}
                                    isRead={notification.isRead}
                                />
                        ))
                    )}
            </div>
            <div
                className={stylesModules.popoverFooterNotification}
                onClick={handleExpandPopover}
            >
                <span
                    className={`nunito - semibold`}
                >
                    {isExpandPopover ? "Ver menos" : "Ver todas"}
                </span>
            </div>
        </div>
    );
};


/* ***************      NOTIFICATIONS Component      *************** */


interface NotificationComponentProps {
    notifications: Notification[]
}

const NotificationComponent = memo(({
    notifications
}: NotificationComponentProps) => {
    return (
        <div>
            <PopoverFloating
                matchWidth={false}
                placement="bottom-start"
                childrenFloating={
                    <NotificationPopover notifications={notifications} />
                }
                childrenTrigger={
                    < button className={stylesModules.notificationButton} >

                        <Indicator
                            inline
                            processing={true}
                            color="red"       // color del punto
                            size={15}          // diámetro del punto
                            offset={4}        // separación del borde
                            position="top-end"
                            label={notifications.length > 0 ? notifications.length : null}
                            classNames={{
                                indicator: stylesModules.indicatorNotification,
                                root: stylesModules.rootIndicatorNotification
                            }}
                        >
                            <Bell size={24} />
                        </Indicator>

                    </button >
                }
            />
        </div >
    );
});

// ***************    ProfilePopoverComponent     *************** */

const ProfilePopoverComponent = memo(() => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userAuth = useSelector((state: RootState) => state.auth);

    const logOutApp = async () => {

        const response = await fetch("http://localhost:3003/authentication/auth/logout", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.ok) {
                dispatch(removeAuth());
                navigate('/login');
            }
        } else {
            console.log(response);
        }
    };

    return (
        <PopoverFloating
            matchWidth={true}
            childrenTrigger={
                <div className={stylesModules.profileContainer}>
                    <div className={stylesModules.profileInfoContainer}>
                        <p className={`nunito - bold ${stylesModules.userName} `}>
                            {`Hola, ${userAuth.username} `}
                        </p>
                        <p className={`nunito - semibold ${stylesModules.userRole} `}>
                            {"Project Manager"}
                        </p>
                    </div>
                    <div className={stylesModules.avatarContainer}>
                        <ProfileIcon className={stylesModules.iconAvatarHeader} />
                    </div>
                </div>
            }
            childrenFloating={
                <div className={stylesModules.popoverProfile}>
                    <div className={stylesModules.popoverProfileInfoContainer}>
                        <ProfileIcon className={stylesModules.avatarProfile} />
                        <p className={`nunito - bold ${stylesModules.userNameProfile} `}>
                            {`Hola, ${userAuth.username} `}
                        </p>
                        <p className={`nunito - semibold ${stylesModules.userRoleProfile} `}>
                            {"Project Manager"}
                        </p>
                    </div>
                    <div className={stylesModules.popoverProfileItemsContainer}>
                        <Link className={stylesModules.popoverProfileItem} to="/profile">
                            <User className={stylesModules.iconPopoverProfile} />
                            <span className={`nunito - semibold`}>Mi perfil</span>
                        </Link>
                        <Link className={stylesModules.popoverProfileItem} to="/config">
                            <Settings className={stylesModules.iconPopoverProfile} />
                            <span className={`nunito - semibold`}>Configuración</span>
                        </Link>
                        <Divider
                            className={stylesModules.popoverProfileDivider}
                            orientation="horizontal"
                        />
                        <div className={stylesModules.popoverProfileItem}
                            onClick={logOutApp}
                        >
                            <LogOut className={stylesModules.iconPopoverProfile} />
                            <span className={`nunito - semibold`}>Cerrar sesión</span>
                        </div>
                    </div>
                </div>
            }
        />

    );
});

const MainLayout = () => {


    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    const handleDesktopToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    return (
        <div
            className={
                `${isSidebarCollapsed
                    ? stylesModules.gridContainerCollapsed
                    : stylesModules.gridContainer
                } `
            }
        >
            <aside
                className={
                    `nunito - medium ${isSidebarCollapsed
                        ? stylesModules.asideCollapsed
                        : stylesModules.aside
                    } `
                }
            >
                <div
                    className={`${stylesModules.logoWrapper} `}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDesktopToggle(e);
                    }}
                >
                    <LogoComponent classNameLogo={stylesModules.navLogoIcon} />
                </div>

                <div className={stylesModules.contentNav}>
                    <div className={stylesModules.navList}>
                        {
                            menuItems.map((item, index) => (
                                <NavItemRenderer
                                    isSidebarCollapsed={isSidebarCollapsed}
                                    key={index}
                                >
                                    {item}
                                </NavItemRenderer>
                            ))
                        }
                    </div>
                </div>
                <div className={`${isSidebarCollapsed ? stylesModules.footerSectionCollapsed : stylesModules.footerSection} `}>
                    {
                        MenuExtra.map((item, index) => (
                            <NavItemExtra
                                key={index}
                                parent={item}
                                iconWithClassParent={item.icon}
                                isSidebarCollapsed={isSidebarCollapsed}
                            />
                        ))
                    }
                    <div
                        className={
                            `${isSidebarCollapsed
                                ? stylesModules.iconExpandButtonContainerCollapsed
                                : stylesModules.iconExpandButtonContainer
                            } `
                        }
                    >
                        <button
                            className={`${isSidebarCollapsed
                                ? stylesModules.expandButtonCollapsed
                                : stylesModules.expandButton
                                } `}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDesktopToggle(e);
                            }}
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
            <header className={stylesModules.header}>
                <div className={stylesModules.headerFeatures}>
                    <NotificationComponent notifications={notifications} />
                    <Divider
                        className={stylesModules.headerDivider}
                        orientation="vertical"
                    />
                    <ProfilePopoverComponent />
                </div>
            </header>
            <main className={stylesModules.main}>
                <Outlet />
            </main>
        </div>
    )
};

interface INavItemRendererProps {
    children: MenuItem;
    isSidebarCollapsed: boolean;
}

const NavItemRenderer = memo(({
    children,
    isSidebarCollapsed,
}: INavItemRendererProps) => {
    const { pathname } = useLocation();   // ← el correcto
    const isActive = pathname === children.path;
    const iconWithClassParent = withClassName(children.icon as ReactElement, `${isActive ? stylesModules.navItemIconActive : ""} ` +
        `${isSidebarCollapsed ? stylesModules.navItemIconCollapsed : stylesModules.navItemIcon} `);

    if (children?.children?.length && children?.children.length > 0) {
        return (
            <NavItemDropdown
                isActive={isActive}
                parent={children}
                iconWithClassParent={iconWithClassParent}
                isSidebarCollapsed={isSidebarCollapsed}
            />
        );
    } else {
        return (
            <NavItem
                isActive={isActive}
                parent={children}
                iconWithClassParent={iconWithClassParent}
                isSidebarCollapsed={isSidebarCollapsed}
            />
        );
    }
})

export default MainLayout;
