import { Image } from 'antd';
import { getLogoImage } from '../../../api';

export default function Logo(){
    const logo=getLogoImage();
    return (
        <Image preview={false} height={"45px"} src={logo} />        
    );
}