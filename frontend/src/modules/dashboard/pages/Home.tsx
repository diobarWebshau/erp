import React, { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import GenericTable from "./../../../components/ui/table/Table copy"; // tu componente genérico
import type { RowAction } from "../../../components/ui/table/types";

// Define la interfaz del dato que va en la tabla
interface User {
  id: number;
  name: string;
  email: string;
}

// Datos iniciales "base de datos"
const initialUsers: User[] = [
  { id: 1, name: "Ana", email: "ana@example.com" },
  { id: 2, name: "Luis", email: "luis@example.com" },
  { id: 3, name: "Marta", email: "marta@example.com" },
];

// Columnas para la tabla
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];

const UsersTableExample = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Función para borrar un usuario (recibe solo el User)
  const onDelete = (user: User) => {
    setUsers((old) => old.filter((u) => u.id !== user.id));
    alert(`Usuario ${user.name} eliminado.`);
  };

  // Función para editar un usuario (simple alert aquí)
  const onEdit = (user: User) => {
    alert(`Editar usuario: ${user.name} (${user.email})`);
  };

  // Ejemplo de rowActions que solo usan User como parámetro
  const rowActions: RowAction<User>[] = [
    {
      label: "Editar",
      onClick: onEdit,
    },
    {
      label: "Eliminar",
      onClick: onDelete,
      disabled: (user) => user.id === 1, // ejemplo: no se puede eliminar usuario con id 1
    },
  ];

  return (
    <GenericTable
      modelName="users"
      columns={columns}
      data={users}
      onAdd={() => alert("Agregar usuario")}
      onDeleteSelected={(selectedUsers) =>
        alert(`Eliminar seleccionados: ${selectedUsers.length}`)
      }
      rowActions={rowActions}
    />
  );
};

export default UsersTableExample;
