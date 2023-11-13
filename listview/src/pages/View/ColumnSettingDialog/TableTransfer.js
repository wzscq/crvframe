import { Table,Transfer } from 'antd'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import difference from 'lodash/difference';

const columns = [
  {
    dataIndex: 'title',
    title: 'Name',
  }
]

export default function TableTransfer({setTargetKeys,setDataSource,...props}){
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
        distance: 1,
      },
    }),
  );

  return (<Transfer {...props}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const Row = (props) => {
        console.log('Row',props);
        const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
          id: props['data-row-key'],
        });
        const style = {
          ...props.style,
          transform: CSS.Transform.toString(
            transform && {
              ...transform,
              scaleY: 1,
            },
          ),
          transition,
          cursor: 'move',
          ...(isDragging
            ? {
                position: 'relative',
                zIndex: 9999,
              }
            : {}),
        };
        return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
      };
    
      
    
      const onDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
          if(direction==='left'){
            setDataSource((prev) => {
              const activeIndex = prev.findIndex((i) => i.key === active.id);
              const overIndex = prev.findIndex((i) => i.key === over?.id);
              const afterMove=arrayMove(prev, activeIndex, overIndex);
              return afterMove;
            });
          } else {
            setTargetKeys((prev) => {
              const activeIndex = prev.findIndex((i) => i === active.id);
              const overIndex = prev.findIndex((i) => i === over?.id);
              const afterMove=arrayMove(prev, activeIndex, overIndex);
              return afterMove;
            });
          }
        }
      };

      const rowSelection = {
        getCheckboxProps: (item) => ({
          disabled: listDisabled || item.disabled,
        }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };

      const scrollY=200;//filteredItems.length*39-120;

      console.log('TableTransfer',filteredItems.length,scrollY)

      return (
        <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
          <SortableContext
            // rowKey array
            items={filteredItems.map((i) => i.key)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={filteredItems}
              components={{
                body: {
                  row: Row,
                },
              }}
              size="small"
              pagination={false}
              scroll={{
                y: scrollY,
              }}
              style={{
                pointerEvents: listDisabled ? 'none' : undefined,
              }}
              onRow={({ key, disabled: itemDisabled }) => ({
                onClick: () => {
                  if (itemDisabled || listDisabled) return;
                  onItemSelect(key, !listSelectedKeys.includes(key));
                },
              })}
            />
          </SortableContext>
        </DndContext>
      );
    }}
  </Transfer>);
};