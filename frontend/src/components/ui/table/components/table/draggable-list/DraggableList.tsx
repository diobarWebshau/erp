import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';

/**
 * Tipo genérico para ítems que deben tener un ID único.
 */
export interface SortableItemType<ID = string> {
  id: ID;
}

/**
 * Props para el ítem individual ordenable.
 * Recibe un render prop para renderizar el contenido custom del ítem.
 */
interface SortableListItemProps<T extends SortableItemType> {
  item: T;
  onDelete: (id: T['id']) => void;
  renderItemContent: (item: T) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente de ítem ordenable genérico.
 * Maneja drag & drop y botón eliminar.
 */
function SortableListItem<T extends SortableItemType>({
  item,
  onDelete,
  renderItemContent,
  className,
  style,
}: SortableListItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    // isDragging,
  } = useSortable({ id: item.id });

  const combinedStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'default',
    userSelect: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    marginBottom: 8,
    borderRadius: 6,
    // backgroundColor: isDragging ? '#b2f5ea' : '#f0f0f0',
    // boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.15)' : undefined,
    position: 'relative', // necesario para restrictToParentElement
    overflow: 'hidden',
    ...style,
  };

  return (
    <li ref={setNodeRef} style={combinedStyle} className={className}>
      {/* Contenido customizado del ítem */}
      <div>{renderItemContent(item)}</div>

      {/* Controles: botón eliminar y handle drag */}
      <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
        <button
          onClick={() => onDelete(item.id)}
          aria-label="Eliminar ítem"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#e53e3e',
          }}
          type="button"
        >
          {/* Puedes cambiar el ícono aquí */}
          &#10005; {/* X simple */}
        </button>

        <button
          {...attributes}
          {...listeners}
          aria-label="Mover ítem"
          style={{
            // background: 'transparent',
            border: 'none',
            cursor: 'grab',
            color: '#4a5568',
          }}
          type="button"
        >
          &#9776; {/* Icono tipo "hamburguesa" para mover */}
        </button>
      </div>
    </li>
  );
}

/**
 * Props para el componente lista ordenable genérico.
 */
interface DraggableListProps<T extends SortableItemType> {
  items: T[];
  onItemsChange: (items: T[]) => void;
  renderItemContent: (item: T) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente lista ordenable genérico y reusable.
 * - `items`: lista de elementos con id.
 * - `onItemsChange`: callback para cambios (reordenar o eliminar).
 * - `renderItemContent`: render prop para el contenido de cada ítem.
 */
export function DraggableList<T extends SortableItemType>({
  items,
  onItemsChange,
  renderItemContent,
  className,
  style,
}: DraggableListProps<T>) {
  // Configuración de sensores (puedes agregar más: KeyboardSensor, TouchSensor)
  const sensors = useSensors(useSensor(PointerSensor));

  /** Manejador al soltar un ítem, reordena si corresponde */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      onItemsChange(newItems);
    }
  };

  /** Manejador para eliminar ítem */
  const handleDelete = (id: T['id']) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]} // Restringe el drag dentro del contenedor padre
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul
          className={className}
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            maxWidth: 400,
            ...style,
          }}
        >
          {items.map((item) => (
            <SortableListItem
              key={item.id}
              item={item}
              onDelete={handleDelete}
              renderItemContent={renderItemContent}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
export default DraggableList;


/* COMO USARLO EN UN COMPONENTE PADRE
    import React, { useState } from 'react';
    import { DraggableList, SortableItemType } from './DraggableList'; // Ajusta la ruta

    interface MyItem extends SortableItemType {
    content: string;
    // otros campos que quieras
    }

    export function MyComponent() {
    const [items, setItems] = useState<MyItem[]>([
        { id: 'a', content: 'Elemento A' },
        { id: 'b', content: 'Elemento B' },
        { id: 'c', content: 'Elemento C' },
    ]);

    return (
        <DraggableList
        items={items}
        onItemsChange={setItems}
        renderItemContent={(item) => <span>{item.content}</span>}
        style={{ margin: 'auto' }}
        />
    );
    }
*/