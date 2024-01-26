import { Collapse } from 'antd';

import NormalGroupItem from "./NormalGroupItem";

import './index.css';

export default function SuperGroupItem({item,index,getLocaleLabel}){
  const childGroups=item.children.map((item,childIndex)=>{
    return (<NormalGroupItem getLocaleLabel={getLocaleLabel} item={item} key={item.id} index={index+childIndex} />)
  });

  const collapseItemChildren=(
    <div className="menu-group-item-super">
      {childGroups}
    </div>
  );

  const collapseItem={
    key: item.id,
    label: getLocaleLabel(item.description),
    children:collapseItemChildren
  };

  return (<Collapse size="small" bordered={false} items={[collapseItem]} />);
}