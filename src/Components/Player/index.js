import React from 'react';
import Button from '../Button';
import LangBtn from '../LangBtn';
import Lang from '../Localization';
import Acc from '../../Funcs/Acc';
import './player.css';
import postData from '../../Funcs/PostDataFuncs';

export default class Player extends React.Component
{
    getGlobalStat = async () => {
        if (!React.isset(window.loft.globalStat)) {
            window.loft.globalStat = await postData({url: window.loft.apiserver + "global-stat/" + window.loft.settings.getGame()});
            window.loft.globalStat = window.loft.globalStat.data;
            window.loft.globalStat.total_wlr = Math.pround(window.loft.globalStat["total_wins"] / window.loft.globalStat["total_failes"], 2);
        }

        if (window.loft.globalStat) {
            for (let f in window.loft.globalStat) {
                document.querySelector(`tr[field="${f}"] > td:last-child`).innerHTML = window.loft.globalStat[f];
            }
        }
    }

    componentDidMount = () => {
        this.getGlobalStat();
    }

    render(){
        let acc = new Acc(this.props.setAppState);

        let rows = [];
        let index = 0;

        for (let f in window.loft.user_info.stat) {
            if (f === "experience") {
                rows.push(<tr key={index} field="total_wlr"><td>{Lang("total_wlr")}</td><td>{Math.pround(window.loft.user_info.stat["total_wins"] / window.loft.user_info.stat["total_failes"], 2)}</td><td></td></tr>);
                index++;
            }
            rows.push(<tr key={index} field={f}><td>{Lang(f)}</td><td>{window.loft.user_info.stat[f]}</td><td></td></tr>);
            index++;
        }

        return (
            <div id="btnContainer" className="animate__fadeIn animate__animated">
                <LangBtn />
                <h5>{window.loft.user_info.display_name}</h5>
                <div className="container">
                <table id="statisticsTable"><thead><tr><th>{Lang("parameter")}</th><th>{Lang("player")}</th><th>{Lang("global")}</th></tr></thead><tbody>{rows}</tbody></table>
                {
                    window.loft.isGuest 
                    ? 
                    <div className="row">
                        <div className="col-md-6 col-12">
                            <Button
                                action={acc.signIn} 
                                href="" 
                                value={Lang("signInText")} 
                                theme="neon"
                                strong="true"
                            />
                        </div>
                    </div>
                    : 
                    <div className="row">
                        <div className="col-md-6 col-12">
                            <Button
                                action={acc.signOut} 
                                href="" 
                                value={Lang("signOutText")} 
                                theme="neon"
                                strong="true"
                            />
                        </div>
                    </div>
                } 
                <div className="row">
                    <div className="col-md-6 col-12">
                        <Button
                            action="" 
                            href="/home" 
                            value={Lang("homePageText")} 
                            theme="neon"
                            strong="true"
                        />
                    </div>
                </div>
                </div>
            </div>
        );
    };
}