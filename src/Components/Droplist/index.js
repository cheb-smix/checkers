import React from 'react';
import Noise from '../../Funcs/Noise';
import "./droplist.css";
import Listitem from './Listitem';

export default class Droplist extends React.Component{
    state = {
        opened: false,
        selectedIndex: this.props.selected,
        selectedText: this.props.items[this.props.selected]
    }
    toggleDroplist = () => {
        Noise("menu-click");
        let a = document.querySelectorAll(".droplist.opened");
        for(let i=0;i<a.length;i++){
            a[i].className = "droplist";
        }
        this.setState({opened: !this.state.opened});
    }
    selectListItem = (val) => {
        this.setState({
            selectedIndex: val,
            selectedText: this.props.items[val]
        })
        this.props.onSelect(this.props.id,val)
    }
    render(){
        let items = '';
        items = Object.keys(this.props.items).map((k) => {
            return <Listitem key={k} text={this.props.items[k]} val={k} selected={this.state.selectedIndex===k} selectListItem={this.selectListItem} />;
        });
        return (
            <div className={this.state.opened?"droplist opened":"droplist"} onClick={this.toggleDroplist}><div className="placeholder" val={this.state.selectedText}>{this.props.placeholder}</div>{items}</div>
        );
    }
}