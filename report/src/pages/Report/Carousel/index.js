import { Carousel } from 'antd';
import { getControl } from '../controls';

export default function CarouselControl({controlConf,reportID,sendMessageToParent,frameParams,locale,theme}){
    const {id,option,minHeight,row,col,colSpan,rowSpan}=controlConf;

    const wrapperStyle={
        gridColumnStart:col,
        gridColumnEnd:col+colSpan,
        gridRowStart:row,
        gridRowEnd:row+rowSpan,
        minHeight:minHeight,
        overflow:'hidden',
        height:'100%'
    }

    const items=option?.controls?.map(item=>{
        return (getControl(item,frameParams,reportID,sendMessageToParent,locale,theme,id))  
    }); 

    return (
        <div style={wrapperStyle} >
            <Carousel autoplay>
                {items}
            </Carousel>
        </div>
    )
}