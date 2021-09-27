import React from 'react';
import Button from '../Button';
import Lang from '../Localization';

import "./about.css";

export function privacyPolicy()
{
    let url = window.loft.config.docsURL
        .replace("{docname}", "privacy-policy")
        .replace("{gamename}", window.loft.settings.getGame())
        .replace("{lang}", window.loft.localization.getLanguage());

    window.loft.showModal(
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <iframe src={url} title={Lang("privacyPolicyText")}></iframe>
                </div>
                <div className="col-md-6 col-12">
                    <Button
                        action={window.loft.hideModal} 
                        href="" 
                        value={Lang("closeText")} 
                        theme="neon"
                        strong="true"
                    />
                </div>
            </div>
        </div>,
        Lang("privacyPolicyText")
    );
}

export async function termsConditions()
{
    let url = window.loft.config.docsURL
        .replace("{docname}", "terms-and-conditions")
        .replace("{gamename}", window.loft.settings.getGame())
        .replace("{lang}", window.loft.localization.getLanguage());

    window.loft.showModal(
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <iframe src={url} title={Lang("termsConditionsText")}></iframe>
                </div>
                <div className="col-md-6 col-12">
                    <Button
                        action={window.loft.hideModal} 
                        href="" 
                        value={Lang("closeText")} 
                        theme="neon"
                        strong="true"
                    />
                </div>
            </div>
        </div>,
        Lang("termsConditionsText")
    );
}

export default class About extends React.Component{
    render(){
        return (
            <div id="btnContainer" className="animate__fadeIn animate__animated aboutPage">
                <h5>{Lang("aboutText")}</h5>
                
                <table>
                    <tbody>
                    <tr><td>{Lang("foreignVersionText")}</td><td>1.0.1</td></tr>
                    <tr><td>{Lang("foreignLastUpdateText")}</td><td>2021.09.24</td></tr>
                    <tr><td>{Lang("internalVersionText")}</td><td>{window.app.version}</td></tr>
                    <tr><td>{Lang("internalLastUpdateText")}</td><td>{window.app.lastUpdate}</td></tr>
                    <tr><td>{Lang("connectionTypeText")}</td><td>{window.loft.connectionType}</td></tr>
                    </tbody>
                </table>
                <div className="col-md-6 col-12">
                <Button action={privacyPolicy} href="" value={Lang("privacyPolicyText")} theme="neon" strong="true" />
                </div>
                <div className="col-md-6 col-12">
                <Button action={termsConditions} href="" value={Lang("termsConditionsText")} theme="neon" strong="true" />
                </div>
                <div className="col-md-6 col-12">
                <Button action="" href="/home" value={Lang("goBackText")} theme="grey" strong="true" />
                </div>
            </div>
        );
    }
}