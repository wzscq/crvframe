import { Timeline as TimelineCtl } from 'antd';
import Title from './Title';

import './index.css';

export default function DateLine({controlConf,reportID,sendMessageToParent,frameParams}){
  const {id,option,minHeight,row,col,colSpan,rowSpan}=controlConf;

  const {title,label,content}=option;
  
  const wrapperStyle={
    gridColumnStart:col,
    gridColumnEnd:col+colSpan,
    gridRowStart:row,
    gridRowEnd:row+rowSpan,
    backgroundColor:"#FFFFFF",
    minHeight:minHeight,
    overflow:'hidden',
    height:'100%'
  }

  return (
    <div style={wrapperStyle} className='report-dateline'>
      <Title text={title}/>
      <TimelineCtl mode={'left'} >
        <TimelineCtl.Item label="2015-09-01">Create a services</TimelineCtl.Item>
        <TimelineCtl.Item label="2015-09-01">Solve initial network problems</TimelineCtl.Item>
        <TimelineCtl.Item>Technical testing</TimelineCtl.Item>
        <TimelineCtl.Item label="2015-09-01">Network problems being solved</TimelineCtl.Item>
      </TimelineCtl>
    </div>
  );
}