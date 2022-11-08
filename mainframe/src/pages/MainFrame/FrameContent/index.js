import { useState } from "react";
import { SplitPane } from "react-collapse-pane";
import FrameTab from './FrameTab';
import MenuBar from "./MenuBar";
import FrameHeader from './FrameHeader';

export default function FrameContent(){   
    const [menuCollapsed,setMenuCollapsed]=useState(false);
    const [inResize,setInResize]=useState(false);
    const hooks={
        onDragStarted:()=>{
            //console.log('onDragStarted...');
            setInResize(true);
        },
        onSaveSizes:()=>{
            //console.log('onSaveSizes...');
            setInResize(false);
        },
        onCollapse:(collapsedSizes)=>{
            if(collapsedSizes[0]!==null){
                setMenuCollapsed(true);
            } else {
                setMenuCollapsed(false);
            }
        }
    } 

    const collapseOptions={
        collapsedSize: 45,
        collapseTransitionTimeout:50
    }

    return (
        <div className="content">
            <SplitPane collapse={collapseOptions} hooks={hooks} dir='ltr' minSizes={[45,200]} initialSizes={[15,85]} split="vertical" >
                <MenuBar collapsed={menuCollapsed}/>
                <div>
                    <FrameHeader/>
                    <FrameTab inResize={inResize} />
                </div>
            </SplitPane>
        </div>);
}