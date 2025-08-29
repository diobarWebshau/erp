
/* COMO USARLO */


// import DraggableList
//     from '../../components/ui/general/draggableList/DraggableList';
// import type {
//     SortableItemType
// } from '../../components/ui/general/draggableList/DraggableList';


// interface MyItem extends SortableItemType {
//     name: string;
// }

// const [items, setItems] = useState<MyItem[]>([
//     { id: '3', name: 'Packaging', sort_order: 3 },
//     { id: '1', name: 'Cutting', sort_order: 1 },
//     { id: '2', name: 'Assembly', sort_order: 2 },
// ]);


// const orderedItems = useMemo(
//     () => [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
//     [items]
// );



/* 

    <DraggableList
        items={orderedItems}
        onItemsChange={(newItems) => {
            console.log('Nuevo orden con sort_order:', newItems);
            setItems(newItems);
        }}
        renderItemContent={(item) => (
            <span>{`${item.sort_order}. ${item.name}`}</span>
        )}
    />
    
*/