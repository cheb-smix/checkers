import React from 'react';
import './lang.css';
import {localization} from '../../Funcs/Lang';

export default class LangBtn extends React.Component {
    state = {
        langs: [
            {
                title: "English",
                code: "en-US",
                lkey: "en",
            },
            {
                title: "Русский",
                code: "ru-RU",
                lkey: "ru",
            },
            {
                title: "Española",
                code: "es-ES",
                lkey: "es",
            },
        ],
        loc: new localization(),
    }

    toggle = () => {
        document.getElementById('langChooser').classList.toggle('closed');
    }

    setLng = (e) => {
        this.state.loc.set(e.target.code);
    }

    render(){
        let availableLangs = this.state.langs.map((lang, l) => {
            return (<li code={lang.code} key={l} lkey={lang.lkey} onClick={this.setLng}>{lang.title}</li>);
        });

        return (
            <div id="langChooser" className="closed">
                <div className='current' lkey={this.state.loc.getLanguage()} onClick={this.toggle}></div>
                <ul>{availableLangs}</ul>
            </div>
        );
    };
}