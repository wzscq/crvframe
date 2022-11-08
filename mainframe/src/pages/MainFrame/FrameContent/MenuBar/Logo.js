import { Image } from 'antd';
import { getLogoImage,getSmallLogoImage } from '../../../../api';

export default function Logo({collapsed}){
    let logo=getLogoImage();
    if(collapsed===true){
        logo=getSmallLogoImage();
    }
    return (
        <Image  preview={false} height={collapsed===true?"35px":"45px"} src={logo} />        
    );
}