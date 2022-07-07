import { Popover } from 'antd';

export default function Preview({maxPreviewWidth,maxPreviewHeight,file,children}){
    const content = (
        <img style={{maxWidth:maxPreviewWidth,maxHeight:maxPreviewHeight}} src={file.url} />
    );

    return (
        <Popover content={content} title={file.name}>
            {children}
        </Popover>
    );
}