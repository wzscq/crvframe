import useI18n from "../../hook/useI18n";

export default function I18nLabel({label}){
    const {getLocaleLabel}=useI18n();
    return (<span>{getLocaleLabel(label)}</span>);
}