import React from 'react';
import Noise from '../../Funcs/Noise';
import Routing from '../../Funcs/Routing';

import "./button.css";

export default class Button extends React.Component
{

    dismiss = () => {
        document.removeEventListener('onAdDismiss', this.dismiss);
        this.trueAction(true);
    }

    buttonAction = () => {
        Noise("menu-click");

        if (["#newgame", "/home"].indexOf(this.props.href) >= 0 && React.isset(window.AdMob)) {

            let ISType = null;

            if (window.loft.connectionType === 'wifi' && React.isset(window.loft.config.ads.interstitialVideo.admob)) {
                ISType = "interstitialVideo";
            } else {
                if (React.isset(window.loft.config.ads.interstitial.admob)) {
                    ISType = "interstitial";
                }
            }

            if (ISType) {
                let currentTime = (new Date()).getTime();

                if (currentTime - window.loft.lastInterstitialShown >= window.loft.config.minutesPerInterstitial * 60000) {
                    if (window.loft.preparingInterstitial) {
                        window.AdMob.isInterstitialReady((ready) => {
                            if (ready) {
                                window.loft.lastInterstitialShown = currentTime;
                                window.loft.preparingInterstitial = false;
                                window.AdMob.showInterstitial();
                                document.addEventListener('onAdDismiss', this.dismiss);
                            } else {
                                this.trueAction();
                            }
                        });
                        return;
                    } else {
                        window.loft.preparingInterstitial = true;
                        window.AdMob.prepareInterstitial({
                            adId: window.loft.config.ads[ISType].admob, 
                            autoShow: false,
                            isTesting: true,
                        });
                    }
                }
            }
        }

        this.trueAction();
    }

    trueAction = (immediate = false) => {
        if (this.props.action !== "") this.props.action();
        if (this.props.href !== "" && this.props.href.indexOf("#") < 0) Routing(this.props.href, () => {}, immediate ? 0 : 700);
    }

    render(){
        let className = "ubutton" + (this.props.theme ? " " + this.props.theme : " maintheme");
        if (this.props.strong) className += " strong";
        return (
            <div onClick={this.buttonAction} className={className}>{this.props.value}</div>
        );
    }
}