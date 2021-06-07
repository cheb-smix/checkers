import React from 'react';
import './lang.css';

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
                title: "Español",
                code: "es-ES",
                lkey: "es",
            },
            {
                title: "Português",
                code: "pt-PT",
                lkey: "pt",
            },
        ],
    }

    toggle = () => {
        document.getElementById('langChooser').classList.toggle('closed');
    }

    setLng = (e) => {
        window.loft.localization.set(e.target.getAttribute('code'), false);
        this.toggle();
    }

    render(){
        let availableLangs = this.state.langs.map((lang, l) => {
            return (<li code={lang.code} key={l} lkey={lang.lkey} onClick={this.setLng}>{lang.title}</li>);
        });

        return (
            <div id="langChooser" className="closed">
                <div className='current' lkey={window.loft.localization.getLanguage()} onClick={this.toggle}></div>
                <ul>{availableLangs}</ul>
            </div>
        );
    };
}