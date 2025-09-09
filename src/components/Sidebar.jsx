import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';

const menuItems = [
  { 
    name: "Dashboard", 
    path: "/", 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1.944 8.167h5.778M1.944 5.056h5.778M1.944 1.944h8.89" />
      </svg>
    )
  },
  {
    name: "Pedidos",
    path: "/orders",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
        <g clipPath="url(#a)">
          <path fill="currentColor" fillRule="evenodd" d="M1.631.37a.75.75 0 0 0-.364 1.455l1.201.3a.14.14 0 0 1 .104.115l.238 1.615.005.038.663 4.501a1.862 1.862 0 0 0 .416 3.675h9.555a.75.75 0 0 0 0-1.5H3.894a.362.362 0 0 1 0-.722h.403a1 1 0 0 0 .083 0h7.095c.704 0 1.332-.45 1.556-1.121l1.184-3.555a1.64 1.64 0 0 0-1.555-2.157H4.202l-.146-.992A1.64 1.64 0 0 0 2.832.67zm2.792 4.144.564 3.833h6.488c.06 0 .114-.038.132-.094l1.185-3.556a.138.138 0 0 0-.132-.183zM3.227 14.653a1.111 1.111 0 1 0 0-2.222 1.111 1.111 0 0 0 0 2.222m10.445-1.111a1.111 1.111 0 1 1-2.223 0 1.111 1.111 0 0 1 2.223 0" clipRule="evenodd" />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h15v15H0z" />
          </clipPath>
        </defs>
      </svg>
    )
  },
  {
    name: "Productos",
    path: "/products",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
        <g clipPath="url(#a)">
          <path fill="currentColor" fillRule="evenodd" d="M2.25 2.389a.14.14 0 0 1 .139-.139h4.375c.272 0 .534.108.727.301l5.11 5.111a1.027 1.027 0 0 1 0 1.453l-3.486 3.487a1.027 1.027 0 0 1-1.453 0L2.552 7.49a1.03 1.03 0 0 1-.302-.727zM2.389.75A1.64 1.64 0 0 0 .75 2.389v4.375c0 .67.267 1.313.74 1.787l5.112 5.111a2.527 2.527 0 0 0 3.574 0l3.486-3.486a2.527 2.527 0 0 0 0-3.574L8.552 1.49A2.53 2.53 0 0 0 6.763.75zm3.778 4.305a1.111 1.111 0 1 1-2.223 0 1.111 1.111 0 0 1 2.223 0" clipRule="evenodd" />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h15v15H0z" />
          </clipPath>
        </defs>
      </svg>
    ),
    submenu: [
      { name: "Catálogo", path: "/products" },
      { name: "Categorías", path: "/categories" },
      { name: "Atributos", path: "/attributes" },
      { name: "Opciones", path: "/options" },
    ]
  },
  {
    name: "Inventario",
    path: "/inventory",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" clipPath="url(#a)">
          <path d="M6.389 13.944V6.39a.89.89 0 0 1 .889-.889h4.889a.89.89 0 0 1 .889.889v7.555M1.944 13.944V3.422c0-.358.214-.68.543-.819l4-1.691a.89.89 0 0 1 1.235.818v1.548M1.056 13.945h12.888M8.611 8.611v-.444M10.833 8.611v-.444M8.611 11.278v-.445M10.833 11.278v-.445" />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h15v15H0z" />
          </clipPath>
        </defs>
      </svg>
    ),
    submenu: [
      { name: "Inventario", path: "/inventory" },
      { name: "Proveedores", path: "/suppliers" },
      { name: "Reservas", path: "/reserves" },
      { name: "Insumos", path: "/inputs" },
      { name: "Órdenes de Compra", path: "/purchase-orders" }
    ]
  },
  {
    name: "Clientes",
    path: "/customers",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" clipPath="url(#a)">
          <path d="M4.701 6.854a1.722 1.722 0 1 0 0-3.444 1.722 1.722 0 0 0 0 3.444M8.024 12.772c.45-.151.715-.64.548-1.084a4.135 4.135 0 0 0-7.74 0c-.167.444.098.934.548 1.084a10.486 10.486 0 0 0 6.644 0M10.083 4.701a1.722 1.722 0 1 0 0-3.444 1.722 1.722 0 0 0 0 3.444M10.728 11.14a10.5 10.5 0 0 0 2.678-.521c.45-.15.714-.64.547-1.084a4.135 4.135 0 0 0-6.146-1.997" />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h15v15H0z" />
          </clipPath>
        </defs>
      </svg>
    ),
    submenu: [
      { name: "Clientes", path: "/customers" },
      { name: "Grupos de clientes", path: "/customer-groups" }
    ]
  },
  {
    name: "Promociones",
    path: "/campaigns",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
        <g clipPath="url(#a)">
          <path fill="currentColor" fillRule="evenodd" d="M2.833 1.593C1.368 1.593.306 2.88.306 4.307v1.474c0 .414.335.75.75.75.375 0 .805.361.805.97 0 .607-.43.968-.805.968a.75.75 0 0 0-.75.75v1.474c0 1.426 1.062 2.715 2.527 2.715h9.334c1.465 0 2.527-1.289 2.527-2.715V9.219a.75.75 0 0 0-.75-.75c-.376 0-.805-.361-.805-.969s.43-.97.805-.97a.75.75 0 0 0 .75-.75V4.308c0-1.426-1.062-2.714-2.527-2.714zM1.806 4.307c0-.743.528-1.214 1.027-1.214h9.334c.499 0 1.027.471 1.027 1.214v.855c-.936.341-1.555 1.303-1.555 2.338s.62 1.997 1.555 2.338v.855c0 .743-.528 1.215-1.027 1.215H2.833c-.499 0-1.027-.472-1.027-1.215v-.855C2.742 9.498 3.36 8.536 3.36 7.5c0-1.035-.62-1.997-1.555-2.338zm8.224.663a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06l4-4a.75.75 0 0 1 1.06 0m-3.419.752a.889.889 0 1 1-1.778 0 .889.889 0 0 1 1.778 0m3.556 3.556a.889.889 0 1 1-1.778 0 .889.889 0 0 1 1.778 0" clipRule="evenodd" />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h15v15H0z" />
          </clipPath>
        </defs>
      </svg>
    )
  }
];

const settingsItems = [
  {
    name: "Configuración",
    path: "/settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
        <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" clipPath="url(#a)">
          <path d="M7.5 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
          <path d="m12.989 5.97-.826-.292a5 5 0 0 0-.323-.685 5 5 0 0 0-.43-.621l.16-.86a1.43 1.43 0 0 0-.692-1.503l-.312-.18a1.43 1.43 0 0 0-1.647.152l-.663.566a5 5 0 0 0-1.513 0L6.08 1.98a1.43 1.43 0 0 0-1.647-.152l-.312.18a1.43 1.43 0 0 0-.691 1.503l.16.857c-.32.4-.574.841-.758 1.31l-.82.29a1.43 1.43 0 0 0-.956 1.35v.36c0 .608.383 1.15.955 1.35l.826.292c.09.232.194.462.323.684.128.222.275.427.43.622l-.16.86c-.111.597.166 1.2.691 1.503l.312.18a1.43 1.43 0 0 0 1.647-.152l.663-.567a5 5 0 0 0 1.512 0l.663.568a1.43 1.43 0 0 0 1.647.152l.312-.18c.526-.304.803-.906.691-1.502l-.16-.86c.32-.398.575-.84.757-1.308l.822-.29c.572-.202.956-.743.956-1.35v-.36c0-.608-.383-1.149-.956-1.35z" />
        </g>
        <defs>
          <clipPath id="a">
            <path fill="#fff" d="M0 0h15v15H0z" />
          </clipPath>
        </defs>
      </svg>
    )
  }
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleSubmenu = (itemName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActiveMenu = (item) => {
    if (item.submenu) {
      return item.submenu.some(subItem => location.pathname === subItem.path);
    }
    return location.pathname === item.path;
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || user?.email || 'Usuario';
  };

  return (
    <div className="hidden h-screen w-[220px] border-r lg:flex">
      <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="bg-ui-bg-subtle sticky top-0">
            <div className="w-full p-3">
              <button
                type="button"
                className="bg-ui-bg-subtle transition-fg grid w-full grid-cols-[24px_1fr_15px] items-center gap-x-3 rounded-md p-0.5 pr-2 outline-none hover:bg-ui-bg-subtle-hover focus-visible:shadow-borders-focus"
              >
                <span className="flex shrink-0 items-center justify-center overflow-hidden shadow-borders-base bg-ui-bg-base h-6 w-6 rounded-md">
                  <span className="aspect-square object-cover object-center txt-compact-xsmall-plus size-5 rounded bg-ui-bg-component-hover text-ui-fg-subtle pointer-events-none flex select-none items-center justify-center">
                    M
                  </span>
                </span>
                <div className="block overflow-hidden text-left">
                  <p className="font-medium font-sans txt-compact-small truncate">
                    CPanel Admin
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" className="text-ui-fg-muted">
                  <path fill="currentColor" fillRule="evenodd" d="M6.306 7.5a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0M1.194 7.5a1.194 1.194 0 1 1 2.39 0 1.194 1.194 0 0 1-2.39 0M11.417 7.5a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="px-3">
              <div aria-orientation="horizontal" role="separator" className="border-ui-border-base bg-transparent h-px w-full bg-[linear-gradient(90deg,var(--border-strong)_1px,transparent_1px)] bg-[length:4px_1px]" />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex flex-1 flex-col">
              <nav className="flex flex-col gap-y-1 py-3">
                {/* Search Button */}
                <div className="px-3">
                  <button className="bg-ui-bg-subtle text-ui-fg-subtle flex w-full items-center gap-x-2.5 rounded-md px-2 py-1 outline-none hover:bg-ui-bg-subtle-hover focus-visible:shadow-borders-focus">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.056 13.056 9.53 9.53M6.389 10.833a4.444 4.444 0 1 0 0-8.888 4.444 4.444 0 0 0 0 8.888" />
                    </svg>
                    <div className="flex-1 text-left">
                      <p className="font-medium font-sans txt-compact-small">Buscar</p>
                    </div>
                    <p className="font-normal font-sans txt-compact-small text-ui-fg-muted">⌘K</p>
                  </button>
                </div>

                {/* Menu Items */}
                {menuItems.map((item) => (
                  <div key={item.name} className="px-3">
                    <div className="w-full">
                      {item.submenu ? (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleSubmenu(item.name)}
                            className={`text-ui-fg-subtle hover:text-ui-fg-base transition-fg hover:bg-ui-bg-subtle-hover flex w-full items-center gap-x-2 rounded-md py-0.5 pl-0.5 pr-2 outline-none ${
                              isActiveMenu(item)
                                ? "bg-ui-bg-base shadow-elevation-card-rest text-ui-fg-base hover:bg-ui-bg-base"
                                : ""
                            }`}
                          >
                            <div className="flex size-6 items-center justify-center">
                              {item.icon}
                            </div>
                            <p className="font-medium font-sans txt-compact-small">{item.name}</p>
                          </button>
                          {expandedMenus[item.name] && (
                            <div className="flex flex-col gap-y-0.5 pb-2 pt-0.5">
                              <ul className="flex flex-col gap-y-0.5">
                                {item.submenu.map((subItem) => (
                                  <li key={subItem.path} className="flex h-7 items-center">
                                    <div className="w-full">
                                      <NavLink
                                        to={subItem.path}
                                        className={({ isActive }) =>
                                          `transition-fg hover:bg-ui-bg-subtle-hover flex items-center gap-x-2 rounded-md outline-none focus-visible:shadow-borders-focus pl-[34px] pr-2 py-1 w-full ${
                                            isActive
                                              ? "bg-ui-bg-base shadow-elevation-card-rest text-ui-fg-base hover:bg-ui-bg-base"
                                              : "text-ui-fg-muted"
                                          }`
                                        }
                                      >
                                        <p className="font-medium font-sans txt-compact-small">{subItem.name}</p>
                                      </NavLink>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover flex items-center gap-x-2 rounded-md py-0.5 pl-0.5 pr-2 outline-none focus-visible:shadow-borders-focus ${
                              isActive
                                ? "bg-ui-bg-base shadow-elevation-card-rest text-ui-fg-base hover:bg-ui-bg-base"
                                : ""
                            }`
                          }
                        >
                          <div className="flex size-6 items-center justify-center">
                            {item.icon}
                          </div>
                          <p className="font-medium font-sans txt-compact-small">{item.name}</p>
                        </NavLink>
                      )}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Settings Section */}
            <div className="flex flex-col gap-y-0.5 py-3">
              {settingsItems.map((item) => (
                <div key={item.name} className="px-3">
                  <div className="w-full">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover flex items-center gap-x-2 rounded-md py-0.5 pl-0.5 pr-2 outline-none focus-visible:shadow-borders-focus ${
                          isActive
                            ? "bg-ui-bg-base shadow-elevation-card-rest text-ui-fg-base hover:bg-ui-bg-base"
                            : ""
                        }`
                      }
                    >
                      <div className="flex size-6 items-center justify-center">
                        {item.icon}
                      </div>
                      <p className="font-medium font-sans txt-compact-small">{item.name}</p>
                    </NavLink>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Profile Section */}
        <div className="bg-ui-bg-subtle sticky bottom-0">
          <div>
            <div className="px-3">
              <div aria-orientation="horizontal" role="separator" className="border-ui-border-base bg-transparent h-px w-full bg-[linear-gradient(90deg,var(--border-strong)_1px,transparent_1px)] bg-[length:4px_1px]" />
            </div>
            <div className="relative">
              <div className="p-3">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="bg-ui-bg-subtle grid w-full cursor-pointer grid-cols-[24px_1fr_15px] items-center gap-2 rounded-md py-1 pl-0.5 pr-2 outline-none hover:bg-ui-bg-subtle-hover focus-visible:shadow-borders-focus"
                >
                  <div className="flex size-6 items-center justify-center">
                    <span className="flex shrink-0 items-center justify-center overflow-hidden shadow-borders-base bg-ui-bg-base rounded-full h-6 w-6">
                      <span className="aspect-square object-cover object-center rounded-full txt-compact-xsmall-plus size-5 bg-ui-bg-component-hover text-ui-fg-subtle pointer-events-none flex select-none items-center justify-center">
                        {getUserInitials()}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center overflow-hidden">
                    <p className="font-medium font-sans txt-compact-xsmall truncate">{getUserDisplayName()}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" className="text-ui-fg-muted">
                    <path fill="currentColor" fillRule="evenodd" d="M6.306 7.5a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0M1.194 7.5a1.194 1.194 0 1 1 2.39 0 1.194 1.194 0 0 1-2.39 0M11.417 7.5a1.194 1.194 0 1 1 2.389 0 1.194 1.194 0 0 1-2.39 0" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute bottom-full left-3 right-3 mb-2 bg-ui-bg-base border border-ui-border-base rounded-md shadow-elevation-modal p-1">
                    <NavLink
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-2 py-1.5 text-ui-fg-base hover:bg-ui-bg-subtle-hover rounded text-sm font-medium transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7.5 9.944a2.444 2.444 0 1 0 0-4.888 2.444 2.444 0 0 0 0 4.888M2.056 12.499c0-2.143 2.439-3.889 5.444-3.889s5.444 1.746 5.444 3.89" />
                      </svg>
                      Perfil
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-ui-fg-base hover:bg-ui-bg-subtle-hover rounded text-sm font-medium transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.389 13.056H2.389a.89.89 0 0 1-.889-.889V2.833c0-.49.399-.889.889-.889h4M10.056 10.5l2.888-2.889-2.888-2.889M12.944 7.61H6.389" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
