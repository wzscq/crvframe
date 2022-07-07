import { Col, Collapse, Row } from 'antd';
import FunctionItem from './FunctionItem';
import I18nLabel from './I18nLabel';

import './FunctionGroup.css';

const { Panel } = Collapse;

export default function FunctionGroup({funcList,sendMessageToParent}){
    const groupItems=funcList.map(item=>{
        const funcItems=item.children.filter(
            item=>item._show!==false
        ).map(item=>(
            <Col key={item.id} span={{ xs: 12, sm: 8, md: 4, lg: 4 }}>
                {
                    <FunctionItem sendMessageToParent={sendMessageToParent} item={item} />
                }
            </Col>
        ));
        
        return funcItems.length>0?(
            <Panel header={<I18nLabel label={item.name} />} key={item.id}>
                <Row gutter={24}>
                {funcItems}
                </Row>
            </Panel>
        ):null;
    });

    return (
        <Collapse className='function-panel' accordion={false} ghost>
            {groupItems}
        </Collapse>
    );
}