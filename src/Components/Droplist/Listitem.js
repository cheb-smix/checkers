import React from 'react';

export default class Listitem extends React.Component{
    render(){
        let {selected,val,text,selectListItem} = this.props;
        return <div className={selected?"listitem selected":"listitem"} onClick={()=>selectListItem(val)}>{text}</div>
    }
}