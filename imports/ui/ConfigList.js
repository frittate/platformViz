import React from 'react';
import {Configuration} from './../api/configuration';

export default class ConfigList extends React.Component{
    renderConfig() {
        configurationList = Configuration.find().fetch();
        return configurationList.map((configItem) => {
                return <p key={configItem._id}>{configItem.tutorsAll}</p>
            });
    }

    render(){
        return (
            <div>
                {this.renderConfig()}
            </div>
        )
    }
}