import { useEffect, useRef, useState, useCallback } from 'react';
import { Arrow, Transformer } from 'react-konva';

const EditableArrow = ({x,y,index,id,width,height,rotation,isSelected,onUpdateShape,scaleX,scaleY,strokeColor,strokeWidth}) => {
    const arrowRef = useRef();
    const trRef = useRef();

    console.log('EditableArrow init',x,y,width,height,isSelected);
  
    useEffect(() => {
      if (trRef.current && arrowRef.current) {
        trRef.current.nodes([arrowRef.current]);
      }
    }, [trRef,arrowRef]);
  
    const handleTransform = useCallback((e) => {
      const node = arrowRef.current;
      console.log('EditableArrow handleTransform',node);
      const width = node.points()[2];
      const height = node.points()[3];
      //console.log('EditableArrow handleTransform',node.points(),width,height);
      onUpdateShape({x:node.x(),y:node.y(),scaleX:node.scaleX(),scaleY:node.scaleY(),rotation:node.rotation(),width:width,height:height},index);
    }, [index,onUpdateShape,arrowRef]);
  
    return (
        <>
          <Arrow 
            ref={arrowRef}
            id={id} 
            x={x} 
            y={y} 
            rotation={rotation}
            draggable
            scaleX={scaleX}
            scaleY={scaleY}
            stroke={strokeColor}
            //width={width}
            //height={height}
            points={[0, 0, width, height]} 
            pointerLength={20} 
            pointerWidth={20} 
            strokeWidth={strokeWidth} 
            fill={strokeColor}
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
  
  export default EditableArrow;