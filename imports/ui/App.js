import React from 'react';
import PropTypes from 'prop-types';
import ConfigList from './ConfigList';
import AddConfig from './AddConfig';

export default class App extends React.Component{
    render(){
        let tutors = this.props.tutors;
        return (
            <div>
                <ConfigList/>
                <AddConfig tutorsAll={tutors}/>
            </div>

        )
    }
}

App.propTypes = {
    tutors: PropTypes.string.isRequired,
};


