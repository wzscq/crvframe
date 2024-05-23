import { Button,Spin,Space } from 'antd';
import I18nLabel from '../component/I18nLabel';

export default function RunSpin(){
    /*return (
      <div style={{position:'absolute',zIndex:999,left:'calc(50vw - 0px)',top:'40vh'}}>
        <Spin size="middle" />
      </div>
    );*/

    return (
      <div style={{position:'absolute',zIndex:999,left:'calc(50vw - 150px)',top:'40vh'}}>
        <Button style={{width:300,textAlign:'left',height:'45px',backgroundColor:"#EEEEEE"}}>
          <Space >
            <Spin size="middle" />
            <I18nLabel label={{key:'dialog.operation.running',default:'运行中，请稍后 ... ...'}}  />
          </Space>
        </Button>
      </div>
    );
}