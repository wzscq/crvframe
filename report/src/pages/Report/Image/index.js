export default function Image({controlConf}){
    return (
        <img src={controlConf.url} alt={""} style={{width:'100%',height:'100%'}}/>
    );
}