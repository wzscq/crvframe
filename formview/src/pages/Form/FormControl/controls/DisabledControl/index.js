const disabledControlStyle={
  width:'100%',
  height:32,
  border:'1px solid rgb(217, 217, 217)',
  borderRadius:2,
  padding:'4px 11px',
  backgroundColor:'#F5F5F5'
}

const inlineControlStyle={
  width:'100%',
  height:28,
  border:'0px solid rgb(217, 217, 217)',
  borderRadius:0,
  padding:'3px 11px',
  backgroundColor:'#F5F5F5'
}

export default function DisabledControl({value,style,inline}){
  if(inline===true){
    return <div style={{...inlineControlStyle,...style}}>{value}</div>     
  }
  return <div style={{...disabledControlStyle,...style}}>{value}</div>        
}