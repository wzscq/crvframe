import useI18n from "../../hooks/useI18n";

export default function I18nLabel({label}){
    const {getLocaleLabel}=useI18n();
    return (<span>{getLocaleLabel(label)}</span>);
}