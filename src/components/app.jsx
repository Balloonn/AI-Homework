import React, { Component, ReactDOM, useEffect } from 'react';
import Home from './content/home';

export default class App extends Component {
    state = { }
    render() {
        return (
            <React.Fragment>
                <div className='container'>
                    <Home/>
                </div>
            </React.Fragment>
        )
    }
}
