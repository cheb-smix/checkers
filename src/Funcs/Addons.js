import React from 'react';

React.isset = (variable) => {
    return typeof (variable) !== 'undefined';
}

React.empty = (variable) => {
    return (variable === '' || !variable || !Object.keys(variable).length);
}

React.langs = [
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
];