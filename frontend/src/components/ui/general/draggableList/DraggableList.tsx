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
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { SortableListItem } from './SortableListItem';
import styles from './DraggableList.module.css';

export interface SortableItemType<ID = string | number> {
    id: ID;
    sort_order?: number;
}

interface DraggableListProps<T extends SortableItemType<any>> {
    items: T[];
    onItemsChange: (items: T[]) => void;
    renderItemContent: (item: T) => React.ReactNode;
    emptyMessage?: string;
}

const DraggableList = <T extends SortableItemType<any>>({
    items,
    onItemsChange,
    renderItemContent,
    emptyMessage = "No hay elementos disponibles.",
}: DraggableListProps<T>) => {
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
            <SortableContext
                items={items.map((item) => item.id as string | number)}
                strategy={verticalListSortingStrategy}
            >
                <ul className={styles.list}>
                    {items.length === 0 ? (
                        <li className={styles.emptyMessage}>{emptyMessage}</li>
                    ) : (
                        items.map((item) => (
                            <SortableListItem
                                key={item.id}
                                item={item}
                                onDelete={handleDelete}
                                renderItemContent={renderItemContent}
                            />
                        ))
                    )}
                </ul>
            </SortableContext>
        </DndContext>
    );
};

export default DraggableList;
