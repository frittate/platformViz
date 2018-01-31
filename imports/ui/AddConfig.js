import React from 'react';
import {Configuration} from './../api/configuration';

export default class AddConfig extends React.Component{
    constructor(props) {
        super(props);
      }

    addConfig(){
        console.log(this.props.tutorsAll);
        Configuration.insert({
            tutorsAll: this.props.tutorsAll,
        })
    }

    render(){
        return (
            <div>
                <button onClick={this.addConfig.bind(this)}>Add</button>
            </div>
        )
    }
}