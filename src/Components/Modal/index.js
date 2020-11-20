import React from 'react';
import "./modal.css";

export default class Modal extends React.Component{
    render(){
        let {modal,closer} = this.props;
        let bgClassName = (modal.code!=="" && modal.bg)?"show":"";
        let panelClassName = modal.code!==""?"show":"";
        panelClassName += (modal.code!=="" && modal.panel)?"":" transparent";
        let header = modal.header===""?"":<h4>{modal.header}</h4>;
        let closeButton = (modal.code!=="" && modal.panel)?<i className="fa fa-2x fa-times" onClick={closer}></i>:"";

        if(modal.autoclose!==false) setTimeout(closer,modal.autoclose*1000);
        return (
            <div>
                <div id="bg" className={bgClassName} onClick={closer}></div>
                <div id="modal" className={panelClassName}>{closeButton}{header}{modal.code}</div>
            </div>
        );
    }
}