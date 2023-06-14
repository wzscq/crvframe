import {getControl} from './controls';

export default function ColumnControl({text,field, record, index}){
    return getControl(text,field, record, index);
}