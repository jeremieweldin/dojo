import React from 'react';

import { PC } from '../../models/party';

import Spin from '../controls/spin';

interface Props {
    pc: PC;
}

interface State {
    pc: PC;
}

export default class PCEditorModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            pc: props.pc
        };
    }

    private changeValue(source: any, field: string, value: any) {
        source[field] = value;

        this.setState({
            pc: this.state.pc
        });
    }

    private nudgeValue(source: any, field: string, delta: number) {
        const value = source[field] + delta;
        this.changeValue(source, field, value);
    }

    public render() {
        try {
            return (
                <div className='pc-editor'>
                    <div className='row section'>
                        <div className='columns small-12 medium-6 large-6'>
                            <div className='subheading'>character name:</div>
                            <input
                                type='text'
                                value={this.state.pc.name}
                                onChange={event => this.changeValue(this.state.pc, 'name', event.target.value)}
                            />
                            <div className='subheading'>player name:</div>
                            <input
                                type='text'
                                value={this.state.pc.player}
                                onChange={event => this.changeValue(this.state.pc, 'player', event.target.value)}
                            />
                            <div className='subheading'>race:</div>
                            <input
                                type='text'
                                value={this.state.pc.race}
                                onChange={event => this.changeValue(this.state.pc, 'race', event.target.value)}
                            />
                            <div className='subheading'>class:</div>
                            <input
                                type='text'
                                value={this.state.pc.classes}
                                onChange={event => this.changeValue(this.state.pc, 'classes', event.target.value)}
                            />
                            <div className='subheading'>level:</div>
                            <Spin
                                source={this.state.pc}
                                name='level'
                                nudgeValue={delta => this.nudgeValue(this.state.pc, 'level', delta)}
                            />
                        </div>
                        <div className='columns small-12 medium-6 large-6'>
                            <div className='subheading'>languages:</div>
                            <input
                                type='text'
                                value={this.state.pc.languages}
                                onChange={event => this.changeValue(this.state.pc, 'languages', event.target.value)}
                            />
                            <div className='subheading'>d&d beyond link:</div>
                            <input
                                type='text'
                                value={this.state.pc.url}
                                placeholder='https://ddb.ac/characters/...'
                                onChange={event => this.changeValue(this.state.pc, 'url', event.target.value)}
                            />
                            <div className='subheading'>passive skills</div>
                            <Spin
                                source={this.state.pc}
                                name='passiveInsight'
                                label='insight'
                                nudgeValue={delta => this.nudgeValue(this.state.pc, 'passiveInsight', delta)}
                            />
                            <Spin
                                source={this.state.pc}
                                name='passiveInvestigation'
                                label='investigation'
                                nudgeValue={delta => this.nudgeValue(this.state.pc, 'passiveInvestigation', delta)}
                            />
                            <Spin
                                source={this.state.pc}
                                name='passivePerception'
                                label='perception'
                                nudgeValue={delta => this.nudgeValue(this.state.pc, 'passivePerception', delta)}
                            />
                        </div>
                    </div>
                </div>
            );
        } catch (e) {
            console.error(e);
        }
    }
}
