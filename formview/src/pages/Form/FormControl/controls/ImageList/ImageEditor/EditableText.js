import { Text, Transformer } from 'react-konva';
import { Html } from 'react-konva-utils';
import { useEffect, useRef, useState, useCallback } from 'react';

//Konva._fixTextRendering = true;

const TextEditor = ({ textNode, onClose, onChange,strokeColor}) => {
  const textareaRef = useRef(null);

  console.log('TextEditor refresh');  

  useEffect(() => {
    console.log('TextEditor useEffect',textareaRef.current);
  }, [textareaRef]);


  useEffect(() => {
    console.log('TextEditor useEffect',textareaRef.current);
    if (!textareaRef.current) return;

    console.log('TextEditor useEffect');

    const textarea = textareaRef.current;
    const stage = textNode.getStage();
    const textPosition = textNode.position();
    const areaPosition = {
      x: textPosition.x,
      y: textPosition.y,
    };

    // Match styles with the text node
    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
    textarea.style.height = `${textNode.height() - textNode.padding() * 2 + 5}px`;
    textarea.style.fontSize = `${textNode.fontSize()}px`;
    textarea.style.lineHeight = textNode.lineHeight();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.stroke();

    const rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
      transform += `rotateZ(${rotation}deg)`;
    }
    textarea.style.transform = transform;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 3}px`;

    textarea.focus();

    const handleOutsideClick = (e) => {
      console.log('TextEditor handleOutsideClick',e.target);
      if (e.target !== textarea) {
        console.log('TextEditor handleOutsideClick');
        onClose(textNode,textarea.value);
      }
    };

    // Add event listeners
    const handleKeyDown = (e) => {
      console.log('TextEditor handleKeyDown',e.key);
      if (e.key === 'Enter' && !e.shiftKey) {
        console.log('handleKeyDown Enter');
        e.preventDefault();
        onClose(textNode,textarea.value);
      }
      if (e.key === 'Escape') {
        console.log('TextEditor handleKeyDown Escape');
        onClose(textNode,textarea.value);
      }
    };

    const handleInput = () => {
      const scale = textNode.getAbsoluteScale().x;
      textarea.style.width = `${textNode.width() * scale}px`;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + textNode.fontSize()}px`;
    };

    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('input', handleInput);
    
    setTimeout(() => {
      console.log('setTimeout click');
      window.addEventListener('click', handleOutsideClick);
    });

    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
      textarea.removeEventListener('input', handleInput);
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [textNode, onChange, onClose,textareaRef]);

  return (
      <textarea
        ref={textareaRef}
        style={{
          minHeight: '1em',
          position: 'absolute',
          border: '1 px solid #AAAAAA',
          padding: '0px',
          margin: '0px',
          overflow: 'hidden',
          background: 'none',
          outline: 'none',
          resize: 'none',
          fontSize:20
        }}
      />
  );
};

const EditableText = ({x,y,onEditEnd,initText,index,isEditing,onEditingStart,id,isSelected,initTextWidth,onUpdateShape,rotation,strokeColor,fontSize}) => {
  const [textWidth, setTextWidth] = useState(initTextWidth);
  const textRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
    }
  }, [isEditing]);

  const handleTextDblClick = useCallback((e) => {
    onEditingStart(index);
  }, [index,onEditingStart]);

  const onClose = useCallback((node,text) => {
    onEditEnd({text:text,width:node.width(),x:node.x(),y:node.y()},index);
  }, [index,onEditEnd]);

  const handleTransform = useCallback((e) => {
    const node = textRef.current;
    const scaleX = node.scaleX();
    const newWidth = node.width() * scaleX;
    setTextWidth(newWidth);
    /*node.setAttrs({
      width: newWidth,
      scaleX: 1,
    });*/
    onUpdateShape({width:node.width(),height:node.height(),scaleX:node.scaleX(),scaleY:node.scaleY(),rotation:node.rotation(),x:node.x(),y:node.y()},index);
    //onUpdateShape({width:newWidth,x:node.x(),y:node.y()},index);
  }, [index,onUpdateShape]);

  const handleDragEnd = useCallback((e) => {
    const node = textRef.current;
    onUpdateShape({width:node.width(),height:node.height(),scaleX:node.scaleX(),scaleY:node.scaleY(),rotation:node.rotation(),x:node.x(),y:node.y()},index);
  }, [index,onUpdateShape]);

  return (
      <>
        <Text
          ref={textRef}
          text={initText}
          x={x}
          y={y}
          id={id}
          fontSize={fontSize}
          draggable
          width={textWidth}
          stroke={strokeColor}
          fill={strokeColor}
          fontStyle={'100'}
          scale={1}
          rotation={rotation}
          listening={true}
          onDblClick={handleTextDblClick}
          onDblTap={handleTextDblClick}
          onTransform={handleTransform}
          onDragEnd={handleDragEnd}
          visible={!isEditing}
        />
        {isEditing && isSelected && (
          <Html>
          <TextEditor
            textNode={textRef.current}
            onClose={onClose}
            strokeColor={strokeColor}
          />
          </Html>
        )}
        {!isEditing && isSelected && (
          <Transformer
            id={"transformer"}
            ref={trRef}
            enabledAnchors={['middle-left', 'middle-right']}
            boundBoxFunc={(oldBox, newBox) => ({
              ...newBox,
              width: Math.max(30, newBox.width),
            })}
          />
        )}
      </>
  );
};

export default EditableText;