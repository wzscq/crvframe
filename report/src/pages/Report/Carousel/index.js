import { Carousel } from 'antd';

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

    const images=option.images.map(item=>{
        return (<img src={item} alt={""} style={{width:'100%',height:'100%'}}/>)  
    }); 

    return (
        <div style={wrapperStyle} >
            <Carousel autoplay>
                {images}
            </Carousel>
        </div>
    )
}