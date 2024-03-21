import { Spin } from 'antd';

export default function RunSpin(){
    return (
      <div style={{position:'absolute',zIndex:999,left:'50vw',top:'40vh'}}>
        <Spin/>
      </div>
    );
}