import { useEffect, useRef, useState, useCallback } from 'react';
import { Ellipse, Transformer } from 'react-konva';

const EditableEllipse = ({x,y,index,id,width,height,rotation,isSelected,onUpdateShape,scaleX,scaleY,strokeColor,strokeWidth}) => {
    const shapRef = useRef();
    const trRef = useRef();
  
    useEffect(() => {
      if (trRef.current && shapRef.current) {
        trRef.current.nodes([shapRef.current]);
      }
    }, [trRef,shapRef]);
  
    const handleTransform = useCallback((e) => {
        const node = shapRef.current;
        console.log('EditableRect handleTransform',node);
        let x = node.x();
        let y = node.y();
        let width = node.radiusX();
        let height = node.radiusY();
        x = x - width;
        y = y - height;
        width = width * 2;
        height = height * 2;
        let rotation = node.rotation();
        let scaleX = node.scaleX();
        let scaleY = node.scaleY();
        onUpdateShape({x:x,y:y,scaleX:scaleX,scaleY:scaleY,rotation:rotation,width:width,height:height},index);
      }, [index,onUpdateShape,shapRef]);
  
    return (
        <>
          <Ellipse 
            ref={shapRef}
            id={id}
            x={x} 
            y={y} 
            scaleX={scaleX} 
            scaleY={scaleY} 
            radiusX={Math.abs(width)} 
            radiusY={Math.abs(height)} 
            rotation={rotation} 
            stroke={strokeColor} 
            strokeWidth={strokeWidth} 
            fill={"transparent"}
            onTransform={handleTransform}
            onDragEnd={handleTransform}
            draggable
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
  
  export default EditableEllipse;