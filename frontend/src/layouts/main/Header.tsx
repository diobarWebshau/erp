import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

const SidebarLayout = () => {
  const containerRef = useRef(null);
  const asideRef = useRef(null);
  const openBtnRef = useRef(null);
  const toggleBtnRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMobileToggle = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleDesktopToggle = (e) => {
    e.stopPropagation();
    setSidebarCollapsed(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarOpen &&
        asideRef.current &&
        !asideRef.current.contains(e.target) &&
        openBtnRef.current &&
        !openBtnRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div
      className={`gridContainer ${sidebarOpen ? 'sidebar-open' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
      ref={containerRef}
    >
      <aside className="aside" ref={asideRef}>
        <section
          id="toggleSidebarBtn"
          className="desktop-only"
          title="Colapsar Sidebar"
          onClick={handleDesktopToggle}
          ref={toggleBtnRef}
        >
          ☰
        </section>
        <section className="content-text">
          <ul className="nav-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
            <li className="nav-item">
              <Link to="/inicio">
                <label className="nav-item-icon">☰</label>
                <label className="nav-label">Inicio</label>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/perfil">
                <label className="nav-item-icon">☰</label>
                <label className="nav-label">Perfil</label>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/configuracion">
                <label className="nav-item-icon">☰</label>
                <label className="nav-label">Configuración</label>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/logout">
                <label className="nav-item-icon">☰</label>
                <label className="nav-label">Cerrar sesión</label>
              </Link>
            </li>
          </ul>
        </section>
      </aside>

      <header className="header">
        <section>
          <h2>Header</h2>
        </section>
        <section className="header-features">
          <section className="header-functions">
            <div className="info-user-notifications">
              <img src="" alt="" />
            </div>
          </section>
          <section className="header-info">
            <div className="info-user">
              <p className="info-user-name">Roberto Mireles</p>
              <p className="info-user-email">Project Manager</p>
            </div>
            <div className="info-user-image">
              <img src="" alt="" />
            </div>
          </section>
          <div
            id="openSidebarBtn"
            className="mobile-only"
            aria-label="Abrir Sidebar"
            onClick={handleMobileToggle}
            ref={openBtnRef}
          >
            ☰
          </div>
        </section>
      </header>

      <main className="main">Main content area</main>
    </div>
  );
};

export default SidebarLayout;
