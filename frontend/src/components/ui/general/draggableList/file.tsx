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
 * Tipo base para ítems ordenables con campo sort_order
 */
export interface SortableItemType<ID = string> {
    id: ID;
    sort_order?: number;
}

/**
 * Props para ítems individuales ordenables
 */
interface SortableListItemProps<T extends SortableItemType> {
    item: T;
    onDelete: (id: T['id']) => void;
    renderItemContent: (item: T) => React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

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
        position: 'relative',
        overflow: 'hidden',
        ...style,
    };

    return (
        <li ref={setNodeRef} style={combinedStyle} className={className}>
            <div>{renderItemContent(item)}</div>

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
                    &#10005;
                </button>

                <button
                    {...attributes}
                    {...listeners}
                    aria-label="Mover ítem"
                    style={{
                        border: 'none',
                        cursor: 'grab',
                        color: '#4a5568',
                    }}
                    type="button"
                >
                    &#9776;
                </button>
            </div>
        </li>
    );
}

/**
 * Props para la lista ordenable
 */
interface DraggableListProps<T extends SortableItemType> {
    items: T[];
    onItemsChange: (items: T[]) => void;
    renderItemContent: (item: T) => React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function DraggableList<T extends SortableItemType>({
    items,
    onItemsChange,
    renderItemContent,
    className,
    style,
}: DraggableListProps<T>) {
    const sensors = useSensors(useSensor(PointerSensor));

    const applySortOrder = (list: T[]): T[] =>
        list.map((item, index) => ({
            ...item,
            sort_order: index + 1,
        }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const reordered = arrayMove(items, oldIndex, newIndex);
            onItemsChange(applySortOrder(reordered));
        }
    };

    const handleDelete = (id: T['id']) => {
        const filtered = items.filter((item) => item.id !== id);
        onItemsChange(applySortOrder(filtered));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement]}
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
