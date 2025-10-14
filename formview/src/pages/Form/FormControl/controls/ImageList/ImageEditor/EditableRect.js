import { useEffect, useRef, useState, useCallback } from 'react';
import { Rect, Transformer } from 'react-konva';

const EditableRect = ({x,y,index,id,width,height,rotation,isSelected,onUpdateShape,scaleX,scaleY,strokeColor,strokeWidth}) => {
    const rectRef = useRef();
    const trRef = useRef();

    console.log('EditableRect init',x,y,width,height,isSelected);
  
    useEffect(() => {
      if (trRef.current && rectRef.current) {
        trRef.current.nodes([rectRef.current]);
      }
    }, [trRef,rectRef]);
  
    /*const handleTransform = useCallback((e) => {
      const node = rectRef.current;
      const scaleX = node.scaleX();
      const newWidth = node.width() * scaleX;
      const scaleY = node.scaleY();
      const newHeight = node.height() * scaleY;
      node.setAttrs({
        width: newWidth,
        scaleX: 1,
        height: newHeight,
        scaleY: 1,
      });
      onUpdateShape({width:node.width(),height:node.height(),x:node.x(),y:node.y(),rotation:node.rotation()},index);
    }, [index,onUpdateShape,rectRef]);
  
    const handleDragEnd = useCallback((e) => {
      const node = rectRef.current;
      onUpdateShape({width:node.width(),height:node.height(),x:node.x(),y:node.y()},index);
    }, [index,onUpdateShape,rectRef]);*/
    const handleTransform = useCallback((e) => {
        const node = rectRef.current;
        //console.log('EditableRect handleTransform',node);
        onUpdateShape({x:node.x(),y:node.y(),scaleX:node.scaleX(),scaleY:node.scaleY(),rotation:node.rotation(),width:node.width(),height:node.height()},index);
      }, [index,onUpdateShape,rectRef]);
  
    return (
        <>
          <Rect 
            ref={rectRef}
            id={id} 
            x={x} 
            y={y} 
            scaleX={scaleX}
            scaleY={scaleY}
            rotation={rotation}
            draggable
            width={width} 
            height={height} 
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            fill={"transparent" } 
            onTransform={handleTransform}
            onDragEnd={handleTransform}
          />
          {isSelected && (
            <Transformer
              id={"transformer"}
              ref={trRef}
              enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-right', 'middle-left', 'bottom-left', 'bottom-center', 'bottom-right']}
              boundBoxFunc={(oldBox, newBox) => ({
                ...newBox,
              })}
            />
          )}
        </>
    );
  };
  
  export default EditableRect;