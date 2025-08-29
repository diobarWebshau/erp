import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './DraggableList.module.css';

interface SortableItemType<ID extends string | number = string> {
    id: ID;
    sort_order?: number;
}

interface SortableListItemProps<T extends SortableItemType> {
    item: T;
    onDelete: (id: T['id']) => void;
    renderItemContent: (item: T) => React.ReactNode;
}

const SortableListItem = <T extends SortableItemType>({
    item,
    onDelete,
    renderItemContent,
}: SortableListItemProps<T>) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li ref={setNodeRef} className={styles.item} style={style}>
            <div>{renderItemContent(item)}</div>
            <div className={styles.controls}>
                <button
                    onClick={() => onDelete(item.id)}
                    className={styles.deleteBtn}
                    type="button"
                    aria-label="Eliminar"
                >
                    ✕
                </button>
                <button
                    {...attributes}
                    {...listeners}
                    className={styles.dragHandle}
                    type="button"
                    aria-label="Mover"
                >
                    ☰
                </button>
            </div>
        </li>
    );
}

export {
    SortableListItem
};

export type {
    SortableItemType
}