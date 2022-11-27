import React, { Component } from 'react';
import G6_render from '../G6_render';
import Data from '../data/data';
import { sleep } from '../utils/sleep';

class Home extends Component {
    state = {
        graph:{},
        animationStep:300,
    }
    
    input_start = React.createRef();  
    input_end = React.createRef();

    cal = (string, end) => {
        let cnt = 0;
        let row_string = 0;
        let col_string = 0;
        let row_end = 0;
        let col_end = 0;
        for(let i=0;i<string.length;i++) {
            if(string[i]!='X') {
                row_string = Math.floor(i / 4);
                col_string = i % 4;
                for(let j=0;j<end.length;j++) {
                    if(end[j] === string[i]) {
                        row_end = Math.floor(j / 4);
                        col_end = j % 4;
                    }
                }
                cnt += Math.abs(row_string - row_end) + Math.abs(col_string - col_end);
            }
        }
        return cnt;
    }

    async startAlgorithm () {
        const start = this.input_start.current.value;
        const end = this.input_end.current.value;
        let amount = 0;
        let cnt_start = 0;
        let cnt_end = 0;
        let open = document.getElementById('OPEN');
        let closed = document.getElementById('CLOSED');

        let buf = '';
        for(let i=0;i<start.length;i++) {
            if(start[i]!='X') buf+=start[i];
            else {
                cnt_start += Math.floor(i/4);
            }
        }
        for(let i=0;i<buf.length;i++) {
            for(let j=i;j<buf.length;j++){
                if(buf[i]>buf[j]) cnt_start++;
            }
        }

        buf = '';
        for(let i=0;i<end.length;i++) {
            if(end[i]!='X') buf+=end[i];
            else {
                cnt_end += Math.floor(i/4);
            }
        }
        for(let i=0;i<buf.length;i++) {
            for(let j=i;j<buf.length;j++){
                if(buf[i]>buf[j]) cnt_end++;
            }
        }

        if((cnt_start & 1) !== (cnt_end & 1)) {
            alert('No solution !!!');
            return;
        }
        
        for(let i=0;i<4;i++) {
            for(let j=0;j<4;j++) {
                Data.state.nodes[i*4+j] = {
                    id: `${i}_${j}`,
                    label: `${1}`,
                    x: 550 + j * 60,
                    y: 65 + i * 60,
                }
            }
        }
        this.state.graph.read(Data.state)

        
        let OPEN = [];
        let CLOSED = [];
        let dist = [];
        let last = [];

        for(let i=0;i<4;i++) {
            for(let j=0;j<4;j++) {
                Data.state.nodes[i*4+j].label = start[i*4+j];
            }
        }
        this.state.graph.read(Data.state)
        await sleep(this.state.animationStep);

        OPEN.push({
            f:this.cal(start, end) + 0,
            string:start,
        });
        amount ++;
        dist[start] = 0;

        open.childNodes[1].appendChild(document.createElement("tr"))
        open.childNodes[1].childNodes[0].innerHTML = 
                    `<th scope="row">${amount}</th>
                    <td>${start}</td>
                    <td>${dist[start]}</td>
                    <td>${this.cal(start,end)}</td>
                    <td>${dist[start]+this.cal(start,end)}</td>`;
        let dx = [-1,1,0,0], dy = [0,0,-1,1];
        let op = "UDLR";

        await sleep(this.state.animationStep);


        while(OPEN.length) {
            let cur = OPEN[0];
            OPEN.splice(0,1);
            let state = cur.string;
            for(let i=0;i<open.childNodes[1].childNodes.length-1;i++) {
                open.childNodes[1].childNodes[i].innerHTML = open.childNodes[1].childNodes[i+1].innerHTML;
            }
            open.childNodes[1].childNodes[open.childNodes[1].childNodes.length-1].remove();
            for(let i=0;i<4;i++) {
                for(let j=0;j<4;j++) {
                    Data.state.nodes[i*4+j].label = state[i*4+j];
                }
            }
            this.state.graph.read(Data.state)
            
            CLOSED.push(cur)
            let closed_length = closed.childNodes[1].childNodes.length;
            closed.childNodes[1].appendChild(document.createElement("tr"))
            closed.childNodes[1].childNodes[closed_length].innerHTML = 
            `<th scope="row">${closed_length+1}</th>
            <td>${state}</td>
            <td>${dist[state]}</td>
            <td>${this.cal(state,end)}</td>
            <td>${dist[state]+this.cal(state,end)}</td>`;

            await sleep(this.state.animationStep);
            if(state === end) break;

            let row_X = 0;
            let col_X = 0;
            for(let i=0;i<state.length;i++) {
                if(state[i] == 'X') {
                    row_X = Math.floor(i / 4);
                    col_X = i % 4;
                    break;
                }
            }
            
            let backup = state;
            for(let i=0 ;i<4;i++) {
                let x = row_X + dx[i];
                let y = col_X + dy[i];
                if(x < 0 || x >= 4 || y < 0 || y >= 4) continue;
                
                let a = row_X*4+col_X, b = x*4+y;
                if(a >= b) {
                    let c = a;
                    a = b;
                    b = c;
                }

                let ch1 = state[a], ch2 = state[b];
                let s1 = state.substr(0,a);
                let s2 = state.substr(a+1);
                state = s1 + ch2 + s2;

                s1 = state.substr(0,b);
                s2 = state.substr(b+1);
                state = s1 + ch1 + s2;
                let flag = true;
                for(let key in dist) {
                    if(key == state) {
                        flag = false;
                        if(dist[state] > dist[backup] + 1) {
                            dist[state] = dist[backup] + 1;

                            let distance = dist[state] + this.cal(state,end);
                            let add = false;
                            let pos = OPEN.length;
                            OPEN.push({});
                            for(let j=0;j<OPEN.length-1;j++) {
                                if(OPEN[j].f > distance) {
                                    for(let k = OPEN.length-1; k > j; k --) {
                                        OPEN[k].f = OPEN[k-1].f;
                                        OPEN[k].string = OPEN[k-1].string;
                                    }
                                    OPEN[j].f = distance;
                                    OPEN[j].string = state;
                                    add = true;
                                    pos = j;
                                    break;
                                }
                            } 
                            if(!add) {
                                OPEN.splice(OPEN.length-1);
                                OPEN.push({
                                    f:distance,
                                    string:state,
                                });
                            }
                            amount++;
                            let open_length = open.childNodes[1].childNodes.length;
                            open.childNodes[1].appendChild(document.createElement("tr"))
                            for(let j=open_length;j>pos;j--) {
                                open.childNodes[1].childNodes[j].innerHTML = open.childNodes[1].childNodes[j-1].innerHTML;
                            }
                            open.childNodes[1].childNodes[pos].innerHTML = 
                            `<th scope="row">${amount}</th>
                            <td>${state}</td>
                            <td>${dist[state]}</td>
                            <td>${this.cal(state,end)}</td>
                            <td>${dist[state]+this.cal(state,end)}</td>`;

                            last[state] = {
                                from: backup,
                                operation: op[i],
                            }
                        }
                        break;
                    }
                }
                if(flag){
                    dist[state] = dist[backup] + 1;
                    let distance = dist[state] + this.cal(state,end);
                    let pos = OPEN.length;
                    let add = false;
                    OPEN.push({});
                    for(let j=0;j<OPEN.length-1;j++) {
                        if(OPEN[j].f > distance) {
                            for(let k = OPEN.length-1; k > j; k --) {
                                OPEN[k].f = OPEN[k-1].f;
                                OPEN[k].string = OPEN[k-1].string;
                            }
                            OPEN[j].f = distance;
                            OPEN[j].string = state;
                            pos = j;
                            add = true;
                            break;
                        }
                    }
                    if(!add) {
                        OPEN.splice(OPEN.length-1);
                        OPEN.push({
                            f:distance,
                            string:state,
                        });
                    }
                    amount++;
                    let open_length = open.childNodes[1].childNodes.length;
                    open.childNodes[1].appendChild(document.createElement("tr"))
                    for(let j=open_length;j>pos;j--) {
                        open.childNodes[1].childNodes[j].innerHTML = open.childNodes[1].childNodes[j-1].innerHTML;
                    }
                    open.childNodes[1].childNodes[pos].innerHTML = 
                    `<th scope="row">${amount}</th>
                    <td>${state}</td>
                    <td>${dist[state]}</td>
                    <td>${this.cal(state,end)}</td>
                    <td>${dist[state]+this.cal(state,end)}</td>`;
                    last[state] = {
                        from: backup,
                        operation: op[i],
                    }
                }
                await sleep(this.state.animationStep);
                state = backup;
            }
        }
        
        let res = '';
        let ans = '';
        let back = end;
        while(back != start) {
            res += last[back].operation;
            back = last[back].from;
        }
        for(let i=0;i<res.length;i++) ans += res[res.length-i-1];
        await sleep(this.state.animationStep);
        alert(`step:${res.length}      op:${ans}`);
    }

    clear = () => {
        Data.state.nodes.splice(0);
        this.state.graph.read(Data.state)

        let open = document.getElementById('OPEN');
        let closed = document.getElementById('CLOSED');
        open.childNodes[1].remove()
        closed.childNodes[1].remove()
        open.appendChild(document.createElement("tbody"))
        closed.appendChild(document.createElement("tbody"))
    }

    render() { 
        return (
            <div>
                <br />
                <div className='col-md-8 UI'>
                   <div className="input-group mb-3">
                        <div className='col-md-2'>
                            <select ref={this.input_type} className='form-select' id='selector_algorithm' defaultValue={'AStar'}>
                                <option value="AStar">A*</option>
                            </select>
                        </div>
                        <input ref={this.input_start} type="text" className="form-control" placeholder='请输入一个起始状态' id='input_start'></input>
                        <input ref={this.input_end} type="text" className="form-control" placeholder='请输入一个终止状态' id='input_end'></input>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => this.startAlgorithm()}>提交</button>
                        <button className="btn btn-outline-secondary" type="button" onClick={() => this.clear()}>清空</button>
                    </div>
                </div>
                <div id="arrList_G6"></div>
                <div className='UI'>
                    <div className="col-md-4.5 tb overflow-auto"  style={{height:'300px'}}>
                        <table className="table table-striped" id='OPEN'>
                            <thead>
                                <tr>
                                    <th scope="col">OPEN表</th>
                                    <th scope="col">状态</th>
                                    <th scope="col">当前距离</th>
                                    <th scope="col">估计距离</th>
                                    <th scope="col">总距离</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                            </tbody>
                        </table>
                    </div>
                    <div className="col-md-4.5 tb overflow-auto"  style={{height:'300px'}}>
                        <table className="table table-striped" id='CLOSED'>
                            <thead>
                                <tr>
                                    <th scope="col">CLOSED表</th>
                                    <th scope="col">状态</th>
                                    <th scope="col">当前距离</th>
                                    <th scope="col">估计距离</th>
                                    <th scope="col">总距离</th>
                                </tr>
                            </thead>
                            <tbody>
                                
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
    componentDidMount() {
        this.setState({graph:G6_render(Data.state, 'arrList_G6')});
    }
}
 
export default Home;