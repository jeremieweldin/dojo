import React from 'react';

import { Col, Drawer, Input, Row } from 'antd';

import Factory from '../../utils/factory';
import Utils from '../../utils/utils';

import { PC } from '../../models/party';

import NumberSpin from '../controls/number-spin';
import PortraitPanel from '../panels/portrait-panel';
import ImageSelectionModal from './image-selection-modal';

interface Props {
    pc: PC;
}

interface State {
    pc: PC;
    showImageSelection: boolean;
}

export default class PCEditorModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            pc: props.pc,
            showImageSelection: false
        };
    }

    private toggleImageSelection() {
        this.setState({
            showImageSelection: !this.state.showImageSelection
        });
    }

    private addCompanion() {
        const companion = Factory.createCompanion();
        companion.name = 'new companion';
        this.state.pc.companions.push(companion);
        this.setState({
            pc: this.state.pc
        });
    }

    private removeCompanion(id: string) {
        // eslint-disable-next-line
        this.state.pc.companions = this.state.pc.companions.filter(c => c.id !== id);
        this.setState({
            pc: this.state.pc
        });
    }

    private changeValue(source: any, field: string, value: any) {
        source[field] = value;

        this.setState({
            pc: this.state.pc,
            showImageSelection: false
        });
    }

    private nudgeValue(source: any, field: string, delta: number) {
        const value = source[field];

        let newValue;
        switch (field) {
            case 'size':
                newValue = Utils.nudgeSize(value, delta);
                break;
            default:
                newValue = (value ? value : 0) + delta;
                break;
        }

        this.changeValue(source, field, newValue);
    }

    public render() {
        try {
            const companions = this.state.pc.companions.map(comp => (
                <Row gutter={10} className='companion' key={comp.id}>
                    <Col span={16}>
                        <Input
                            value={comp.name}
                            allowClear={true}
                            onChange={event => this.changeValue(comp, 'name', event.target.value)}
                        />
                    </Col>
                    <Col span={8}>
                        <button onClick={() => this.removeCompanion(comp.id)}>delete</button>
                    </Col>
                </Row>
            ));

            if (companions.length === 0) {
                companions.push(
                    <div className='section' key='empty'>
                        <i>no companions (pets, retainers, mounts, etc)</i>
                    </div>
                );
            }

            return (
                <Row className='full-height'>
                    <Col span={12} className='scrollable'>
                        <div className='subheading'>character name:</div>
                        <Input
                            value={this.state.pc.name}
                            allowClear={true}
                            onChange={event => this.changeValue(this.state.pc, 'name', event.target.value)}
                        />
                        <div className='subheading'>player name:</div>
                        <Input
                            value={this.state.pc.player}
                            allowClear={true}
                            onChange={event => this.changeValue(this.state.pc, 'player', event.target.value)}
                        />
                        <div className='subheading'>size</div>
                        <NumberSpin
                            source={this.state.pc}
                            name='size'
                            nudgeValue={delta => this.nudgeValue(this.state.pc, 'size', delta)}
                        />
                        <div className='subheading'>race:</div>
                        <Input
                            value={this.state.pc.race}
                            allowClear={true}
                            onChange={event => this.changeValue(this.state.pc, 'race', event.target.value)}
                        />
                        <div className='subheading'>class:</div>
                        <Input
                            value={this.state.pc.classes}
                            allowClear={true}
                            onChange={event => this.changeValue(this.state.pc, 'classes', event.target.value)}
                        />
                        <div className='subheading'>level:</div>
                        <NumberSpin
                            source={this.state.pc}
                            name='level'
                            nudgeValue={delta => this.nudgeValue(this.state.pc, 'level', delta)}
                        />
                        <div className='subheading'>passive skills</div>
                        <NumberSpin
                            source={this.state.pc}
                            name='passiveInsight'
                            label='insight'
                            nudgeValue={delta => this.nudgeValue(this.state.pc, 'passiveInsight', delta)}
                        />
                        <NumberSpin
                            source={this.state.pc}
                            name='passiveInvestigation'
                            label='investigation'
                            nudgeValue={delta => this.nudgeValue(this.state.pc, 'passiveInvestigation', delta)}
                        />
                        <NumberSpin
                            source={this.state.pc}
                            name='passivePerception'
                            label='perception'
                            nudgeValue={delta => this.nudgeValue(this.state.pc, 'passivePerception', delta)}
                        />
                    </Col>
                    <Col span={12} className='scrollable'>
                        <div className='subheading'>languages:</div>
                        <Input
                            value={this.state.pc.languages}
                            allowClear={true}
                            onChange={event => this.changeValue(this.state.pc, 'languages', event.target.value)}
                        />
                        <div className='subheading'>d&d beyond link:</div>
                        <Input
                            value={this.state.pc.url}
                            placeholder='https://ddb.ac/characters/...'
                            allowClear={true}
                            onChange={event => this.changeValue(this.state.pc, 'url', event.target.value)}
                        />
                        <div className='subheading'>portrait</div>
                        <PortraitPanel
                            source={this.state.pc}
                            edit={() => this.toggleImageSelection()}
                            clear={() => this.changeValue(this.state.pc, 'portrait', '')}
                        />
                        <div className='subheading'>companions:</div>
                        {companions}
                        <button onClick={() => this.addCompanion()}>add a new companion</button>
                    </Col>
                    <Drawer visible={this.state.showImageSelection} closable={false} onClose={() => this.toggleImageSelection()}>
                        <ImageSelectionModal select={id => this.changeValue(this.state.pc, 'portrait', id)} cancel={() => this.toggleImageSelection()} />
                    </Drawer>
                </Row>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}
