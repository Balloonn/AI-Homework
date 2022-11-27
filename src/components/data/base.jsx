import React, { Component } from 'react';

export class Base extends Component{
    state = {
            nodes: [
              ],
            edges: [
              ],
            name:'',

    }

    constructor (name) {
      super();
      this.state.name = name;
    }
}
