// src/pages/admin/AdminLayout.tsx
import { Link, Outlet, useLocation } from "react-router-dom"

const AdminLayout = () => {
  const location = useLocation()

  const menuItems = [
    { label: "Clientes SaaS", path: "/admin/clientes" },
    { label: "Relatórios", path: "/admin/relatorios" },
    { label: "Sistema Configurações", path: "/admin/sistema" },
    { label: "Usuários Admin", path: "/admin/usuarios" },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-6">Painel Admin</h2>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block py-2 px-3 rounded hover:bg-gray-700 ${
              location.pathname === item.path ? "bg-gray-700" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout

