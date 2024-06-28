import MultiSelectForOptions from "./MultiSelectForOptions";
import MultiSelectForManyToMany from "./MultiSelectForManyToMany";
import {FIELD_TYPE} from '../../../../../utils/constant';

export default function SingleSelect(props){
    const {field}=props;
    if(field.fieldType){
        if(field.fieldType===FIELD_TYPE.MANY2MANY){
            return (<MultiSelectForManyToMany {...props} />)
        }
    }

    return (<MultiSelectForOptions {...props} />)
}