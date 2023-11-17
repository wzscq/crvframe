import { useState } from "react";
import { Table } from "antd";
import ResizableTitle from "./ResizableTitle";

export default function ResizableTable(props){
  const [columns, setColumns] = useState(props.columns || []);

  const handleResize = (index) => (e, size) => {
    const nextColumns = [...columns];
    nextColumns[index] = {
      ...nextColumns[index],
      width: size.width,
    };
    setColumns(nextColumns);
  };

  let totalWidth = 0;
  const cols = columns.map((col, index) => {
    
    totalWidth += col.width;

    return {
      ...col,
      onHeaderCell: (column) => ({
        width: column.width,
        onResize: handleResize(index),
      })
    }
  });

  const scroll={...props.scroll}
  scroll.x = totalWidth;

  return (
    <Table
      {...props}
      components={{ header: { cell: ResizableTitle } }}
      columns={cols}
      scroll={scroll}
    />
  );
}