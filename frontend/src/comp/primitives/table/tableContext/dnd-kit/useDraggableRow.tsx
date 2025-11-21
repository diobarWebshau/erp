import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Row } from "@tanstack/react-table";

const useDraggableRow = <T,>(row: Row<T>) => {
  // Row.id  ← viene de getRowId de TanStack
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id: row.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return { setNodeRef, attributes, listeners, style };
}


export default useDraggableRow;