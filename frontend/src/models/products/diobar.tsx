import React, { useState } from "react";
import DraggableList from "../../components/ui/general/draggableList/DraggableList";

interface MyItem {
  id: number;
  name: string;
  sort_order?: number;
}

const ParentComponent = () => {
  const [items, setItems] = useState<MyItem[]>([
    { id: 1, name: "Item uno", sort_order: 1 },
    { id: 2, name: "Item dos", sort_order: 2 },
    { id: 3, name: "Item tres", sort_order: 3 },
  ]);

  return (
    <div>
      <h2>Lista arrastrable</h2>
      <DraggableList
        items={items}
        onItemsChange={setItems}
        renderItemContent={(item) => (
          <span>{`${item.sort_order}. ${item.name}`}</span>
        )}
        emptyMessage="No hay elementos para mostrar."
      />
    </div>
  );
};

export default ParentComponent;
