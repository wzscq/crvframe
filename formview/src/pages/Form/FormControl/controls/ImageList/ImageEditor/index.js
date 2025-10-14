'use client'
import React, { useState, useCallback, useRef }  from "react";
import { Stage, Layer, Image,Rect ,Ellipse,Arrow,Text} from 'react-konva';
import useImage from 'use-image';
import EditableText from './EditableText';
import EditableRect from './EditableRect';
import EditableArrow from './EditableArrow';
import EditableEllipse from './EditableEllipse';
import './index.css';

function getRelativePointerPosition(node) {
    // the function will return pointer position relative to the passed node
    const transform = node.getAbsoluteTransform().copy();
    // to detect relative position we need to invert transform
    transform.invert();
  
    // get pointer (say mouse or touch) position
    const pos = node.getStage().getPointerPosition();
  
    // now we find relative point
    return transform.point(pos);
}

const ImageEditor = ({imageUrl,width,height,toolbar}) => {
    const [image] = useImage(imageUrl, 'anonymous');
    const [shapes, setShapes] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawShapeType, setDrawShapeType] = useState(null);
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(-1);
    const [fontSize, setFontSize] = useState(20);
    const [strokeWidth, setStrokeWidth] = useState(4);
    const stageRef = useRef(null);

    console.log(shapes,isDrawing,drawShapeType);

    const onUpdateShape = useCallback(({x,y,rotation,scaleX,scaleY,width,height},index) => {
        const shapeText = {...shapes[index]};
        console.log('EditableRect onUpdateShape',width,height,x,y,index);
        shapeText.scaleX= scaleX;
        shapeText.scaleY= scaleY;
        shapeText.rotation= rotation;
        shapeText.points[0].x= x;
        shapeText.points[0].y= y;
        if(width!==undefined) {
            shapeText.points[1].x= shapeText.points[0].x+width;
            shapeText.width= width;
        }
        if(height!==undefined) {
            shapeText.points[1].y= shapeText.points[0].y+height;
            shapeText.height= height;
        }
        const newShapes = [...shapes];
        //替换位置index的shape
        newShapes[index] = shapeText;
        setShapes(newShapes);
    },[shapes,setShapes])

    const onEditEnd = useCallback(({text,width,x,y},index) => {
        const shapeText = {...shapes[index]};
        shapeText.text= text;
        shapeText.width= width;
        shapeText.points[0].x= x;
        shapeText.points[0].y= y;
        shapeText.isEditing= false;
        const newShapes = [...shapes];
        //替换位置index的shape
        newShapes[index] = shapeText;
        setIsDrawing(false);
        setShapes(newShapes);
    },[shapes,setShapes])

    const onEditingStart = useCallback((index) => {
        const shapeText = {...shapes[index]};
        shapeText.isEditing= true;
        const newShapes = [...shapes];
        //替换位置index的shape
        newShapes[index] = shapeText;
        setShapes(newShapes);
        setIsDrawing(true);
    },[shapes,setShapes])

    const onClick = useCallback((e) => {
        console.log('ImageEditor onClick',e.target);

    },[])

    const onDblClick = useCallback((e) => {
        console.log('ImageEditor onDblClick',e.target);
    },[])

    const onMouseDown = useCallback((e) => {
        console.log('onMouseDown selectedShapeIndex',selectedShapeIndex,drawShapeType,isDrawing);
        if (isDrawing===true) {
            return;
        }
        //如果当前位置有选中的shape，则将其选中
        const point = getRelativePointerPosition(e.target.getStage());
        //将point作为中心点，向四周10个像素，找到最近的shape
        const shapeNode = stageRef.current.getIntersection(point,10);
        console.log('onMouseDown',shapeNode,shapeNode.id());

        //如果选中了shape，则不进行绘制
        /*if (shapeNode&&shapeNode.id()==='image'&&selectedShapeIndex!==-1) {
            setSelectedShapeIndex(-1);
            return;
        }*/

        console.log('onMouseDown selectedShapeIndex',selectedShapeIndex,shapeNode.id());

        if(selectedShapeIndex!==-1) {
            //如果当前选怎节点是text类型，且在编辑状态中，则先不处理
            if(shapes[selectedShapeIndex].type==='text'&&shapes[selectedShapeIndex].isEditing===true){
                console.log('onMouseDown setSelectedShapeIndex:',shapes[selectedShapeIndex])
                return;
            }
            
            //如果选中的shape不是当前shape，则取消选中
            if(shapeNode&&shapeNode.id()!==''&&shapeNode.id()!==selectedShapeIndex) {
                console.log('onMouseDown setSelectedShapeIndex to -1',selectedShapeIndex,JSON.stringify(shapeNode.id()));
                setSelectedShapeIndex(-1);
            }
            return;
        }

        //如果之前选中了shape，则先取消选中
        /*if(shapeNode&&shapeNode.id()!==undefined) {
            setSelectedShapeIndex(-1);
            return;
        }*/

        if (drawShapeType===null) {
            return;
        }

        //const point = getRelativePointerPosition(e.target.getStage());
        const shape = {
            type:drawShapeType,points:[{...point},{...point}],isEditing:false,width:0,height:0,strokeColor:strokeColor,fontSize:fontSize,strokeWidth:strokeWidth
        };
        
        if (drawShapeType==='text') {
            shape.width = 100;
        }
        
        setSelectedShapeIndex(shapes.length);
        setShapes([...shapes].concat(shape));
        //文本类型的shape不需要鼠标拖动绘制
        if (drawShapeType==='text') {
            return;
        }
        setIsDrawing(true);
    },[shapes,setIsDrawing,isDrawing,setShapes,drawShapeType,setSelectedShapeIndex,selectedShapeIndex,strokeColor,fontSize,strokeWidth])
    const onMouseUp = useCallback((e) => {
        if (isDrawing===true) {
            //如果最后一个shape的type是text，则不进行操作
            if (shapes[shapes.length - 1].type==='text') {
                return;
            }

            setIsDrawing(false);
            const lastShape = shapes[shapes.length - 1];
            const point = getRelativePointerPosition(e.target.getStage());
            lastShape.points[1] = { ...point };
            lastShape.width = Math.abs(lastShape.points[1].x - lastShape.points[0].x);
            lastShape.height = Math.abs(lastShape.points[1].y - lastShape.points[0].y);
            shapes.splice(shapes.length - 1, 1);
            setShapes(shapes.concat([lastShape]));
            setSelectedShapeIndex(shapes.length);
        }
    },[shapes,setIsDrawing,setShapes])

    const onMouseMove = useCallback((e) => {
        if (isDrawing===true) {
            //如果最后一个shape的type是text，则不进行操作
            if (shapes[shapes.length - 1].type==='text') {
                return;
            }
            const lastShape = {...shapes[shapes.length - 1]};
            //如果最后一个shape的type是text，则不进行操作
            console.log(shapes,lastShape);
            const point = getRelativePointerPosition(e.target.getStage());
            lastShape.points[1] = { ...point };
            lastShape.width = Math.abs(lastShape.points[1].x - lastShape.points[0].x);
            lastShape.height = Math.abs(lastShape.points[1].y - lastShape.points[0].y);
            const newShapes = [...shapes];
            newShapes.splice(shapes.length - 1, 1);
            setShapes(newShapes.concat([lastShape]));
        }
    },[shapes,isDrawing,setShapes])

    const shapeToComponent = (shape,index)=>{

        const isSelected = selectedShapeIndex===index;

        switch(shape.type){
            case 'rect':
                {
                    const x = shape.points[0].x;
                    const y = shape.points[0].y;
                    const width = shape.points[1].x - shape.points[0].x;
                    const height = shape.points[1].y - shape.points[0].y;
                    if(isSelected) {
                        return <EditableRect strokeColor={shape.strokeColor} isSelected={isSelected} scaleX={shape.scaleX} scaleY={shape.scaleY} rotation={shape.rotation} index={index} id={index} key={index} x={x} y={y} width={width} height={height} onUpdateShape={onUpdateShape} strokeWidth={shape.strokeWidth} />
                    } else {
                        return <Rect stroke={shape.strokeColor} id={index} scaleX={shape.scaleX} scaleY={shape.scaleY} key={index} x={x} y={y} width={width} height={height} rotation={shape.rotation} strokeWidth={shape.strokeWidth} fill={"transparent" } />
                    }
                }
            case 'arrow':
                {
                    const x = shape.points[0].x;
                    const y = shape.points[0].y;
                    const width = shape.points[1].x - shape.points[0].x;
                    const height = shape.points[1].y - shape.points[0].y;
                    if(isSelected) {
                        return <EditableArrow strokeWidth={shape.strokeWidth} strokeColor={shape.strokeColor} isSelected={isSelected} scaleX={shape.scaleX} scaleY={shape.scaleY} index={index} id={index} key={index} x={x} y={y} rotation={shape.rotation} width={width} height={height} onUpdateShape={onUpdateShape} />
                    } else {
                        return <Arrow strokeWidth={shape.strokeWidth} stroke={shape.strokeColor} id={index} key={index} x={x} scaleX={shape.scaleX} scaleY={shape.scaleY} points={[0, 0, width, height]} y={y} rotation={shape.rotation} pointerLength={20} pointerWidth={20} fill={strokeColor} />
                    }
                }
            case 'ellipse':
                {
                    const width = (shape.points[1].x - shape.points[0].x)/2;
                    const height = (shape.points[1].y - shape.points[0].y)/2;
                    const x = shape.points[0].x+width;
                    const y = shape.points[0].y+height;
                    
                    if(isSelected) {
                        return <EditableEllipse strokeWidth={shape.strokeWidth} strokeColor={shape.strokeColor} isSelected={isSelected} scaleX={shape.scaleX} scaleY={shape.scaleY} index={index} width={width} height={height} id={index} key={index} x={x} y={y} rotation={shape.rotation} onUpdateShape={onUpdateShape} />
                    } else {
                        return <Ellipse strokeWidth={shape.strokeWidth} stroke={shape.strokeColor} id={index} key={index} x={x} y={y} scaleX={shape.scaleX} scaleY={shape.scaleY} radiusX={Math.abs(width)} radiusY={Math.abs(height)} rotation={shape.rotation} fill={"transparent"} />
                    }
                }
            case 'text':
                {
                    const x = shape.points[0].x;
                    const y = shape.points[0].y;
                    if(isSelected) {
                        return (<EditableText 
                        isSelected={isSelected} 
                        strokeColor={shape.strokeColor}
                        initTextWidth={shape.width}
                        fontSize={shape.fontSize}
                        id={index} 
                        key={index} 
                        index={index} 
                        rotation={shape.rotation}
                        x={x} 
                        y={y} 
                        onEditEnd={onEditEnd} 
                        initText={shape.text??""} 
                        isEditing={shape.isEditing} 
                        onEditingStart={onEditingStart} 
                        onUpdateShape={onUpdateShape} />
                        )
                    } else {
                        return <Text stroke={shape.strokeColor} fontStyle={'100'} key={index} x={x} y={y} text={shape.text??""} fontSize={shape.fontSize} width={shape.width} rotation={shape.rotation} />
                    }
                }

        }

        return null;
    }

    const getDataUrl = useCallback(() => {
        return stageRef.current.toDataURL();
    },[stageRef])

    return (
        <div className="image-editor-wrapper">
            <div className="image-editor-header">
                {toolbar&&toolbar({drawShapeType,setDrawShapeType,getDataUrl,strokeColor,setStrokeColor,fontSize,setFontSize,strokeWidth,setStrokeWidth})}
            </div>
            <div className="image-wrapper">
                <Stage 
                    ref={stageRef}
                    width={image?.width}
                    height={image?.height}
                    onMouseDown={onMouseDown}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                    onClick={onClick}
                    onDblClick={onDblClick}
                    >
                    <Layer>
                        <Image id="image" image={image} />
                    </Layer>
                    <Layer>
                        {shapes.map((shape,index)=>shapeToComponent(shape,index))}
                    </Layer>
                </Stage>
            </div>
        </div>
    )

}

export default ImageEditor;