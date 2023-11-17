import { Resizable } from 'react-resizable';
import { useState } from "react";

import "./index.css";

export default function ResizableTitle({ onColumnResize,width,resizable, ...restProps }){
  const [newWidth, setNewWidth] = useState(width);
  const [lastWidth, setLastWidth] = useState(width);
  const [inResize, setInResize] = useState(false);
  const onResize = (event, { size }) => {
    setNewWidth(size.width);
  }

  const onResizeStop = (event, {node, size, handle}) => {
    setInResize(false);
    setLastWidth(size.width);
    onColumnResize(size.width);
    console.log('onResizeStop',newWidth,size.width);
  }

  const onResizeStart = (event, {node, size, handle}) => {
    setInResize(true);
    console.log('onResizeStart',width);
  }

  return (
    resizable===true?
    <Resizable
      width={newWidth}
      height={0}
      handle={
        <div
          className="react-resizable-handle"
          style={{right:lastWidth-newWidth,border:inResize===true?'1px dotted':null}}
        />
      }
      onResize={onResize}
      onResizeStart={onResizeStart}
      onResizeStop={onResizeStop}
    >
    <th {...restProps} style={{overflow:inResize===true?'visible':'hidden'}} />
    </Resizable>:<th {...restProps} />
  );
}