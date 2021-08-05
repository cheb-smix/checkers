import React from 'react';
import './lang.css';

export default class LangBtn extends React.Component {
    toggle = () => {
        document.getElementById('langChooser').classList.toggle('closed');
    }

    setLng = (e) => {
        window.loft.localization.set(e.target.getAttribute('code'), false);
        this.toggle();
    }

    render(){
        let availableLangs = Object.keys(window.loft.localization.langTitles).map((key, index) => {
            return (<li code={key} key={index} onClick={this.setLng}>{window.loft.localization.langTitles[key]}</li>);
        });

        return (
            <div id="langChooser" className="closed">
                <div className='current' code={window.loft.localization.getLanguage()} onClick={this.toggle}></div>
                <ul>{availableLangs}</ul>
            </div>
        );
    };
}