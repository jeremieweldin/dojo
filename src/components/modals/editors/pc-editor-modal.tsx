import { DeleteOutlined } from '@ant-design/icons';
import { Col, Drawer, Row } from 'antd';
import React from 'react';

import Factory from '../../../utils/factory';
import Gygax from '../../../utils/gygax';
import Utils from '../../../utils/utils';

import { MonsterGroup } from '../../../models/monster';
import { PC } from '../../../models/party';

import Dropdown from '../../controls/dropdown';
import NumberSpin from '../../controls/number-spin';
import Textbox from '../../controls/textbox';
import PortraitPanel from '../../panels/portrait-panel';
import ImageSelectionModal from '../image-selection-modal';

interface Props {
	pc: PC;
	library: MonsterGroup[];
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
		const pc = this.state.pc;
		pc.companions = this.state.pc.companions.filter(c => c.id !== id);
		this.setState({
			pc: pc
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
				newValue = Gygax.nudgeSize(value, delta);
				break;
			default:
				newValue = (value ? value : 0) + delta;
				break;
		}

		this.changeValue(source, field, newValue);
	}

	public render() {
		try {
			const monsterOptions: { id: string, text: string }[] = [];
			this.props.library.forEach(group => {
				group.monsters.forEach(monster => {
					monsterOptions.push({
						id: monster.id,
						text: monster.name
					});
				});
			});
			Utils.sort(monsterOptions, [{ field: 'text', dir: 'asc' }]);

			const companions = this.state.pc.companions.map(comp => (
				<div className='group-panel companion-list-item' key={comp.id}>
					<div className='companion-fields'>
						<Textbox
							text={comp.name}
							onChange={value => this.changeValue(comp, 'name', value)}
						/>
						<Dropdown
							options={monsterOptions}
							placeholder='select a stat block'
							selectedID={comp.monsterID || undefined}
							onSelect={value => this.changeValue(comp, 'monsterID', value)}
							onClear={() => this.changeValue(comp, 'monsterID', null)}
						/>
					</div>
					<div className='companion-actions'>
						<DeleteOutlined onClick={() => this.removeCompanion(comp.id)} />
					</div>
				</div>
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
						<Textbox
							text={this.state.pc.name}
							onChange={value => this.changeValue(this.state.pc, 'name', value)}
						/>
						<div className='subheading'>player name:</div>
						<Textbox
							text={this.state.pc.player}
							onChange={value => this.changeValue(this.state.pc, 'player', value)}
						/>
						<div className='subheading'>size</div>
						<NumberSpin
							value={this.state.pc.size}
							downEnabled={this.state.pc.size !== 'tiny'}
							upEnabled={this.state.pc.size !== 'gargantuan'}
							onNudgeValue={delta => this.nudgeValue(this.state.pc, 'size', delta)}
						/>
						<div className='subheading'>race:</div>
						<Textbox
							text={this.state.pc.race}
							onChange={value => this.changeValue(this.state.pc, 'race', value)}
						/>
						<div className='subheading'>class:</div>
						<Textbox
							text={this.state.pc.classes}
							onChange={value => this.changeValue(this.state.pc, 'classes', value)}
						/>
						<div className='subheading'>level:</div>
						<NumberSpin
							value={this.state.pc.level}
							downEnabled={this.state.pc.level > 1}
							upEnabled={this.state.pc.level < 20}
							onNudgeValue={delta => this.nudgeValue(this.state.pc, 'level', delta)}
						/>
						<div className='subheading'>passive skills</div>
						<NumberSpin
							value={this.state.pc.passiveInsight}
							label='insight'
							downEnabled={this.state.pc.passiveInsight > 0}
							onNudgeValue={delta => this.nudgeValue(this.state.pc, 'passiveInsight', delta)}
						/>
						<NumberSpin
							value={this.state.pc.passiveInvestigation}
							label='investigation'
							downEnabled={this.state.pc.passiveInvestigation > 0}
							onNudgeValue={delta => this.nudgeValue(this.state.pc, 'passiveInvestigation', delta)}
						/>
						<NumberSpin
							value={this.state.pc.passivePerception}
							label='perception'
							downEnabled={this.state.pc.passivePerception > 0}
							onNudgeValue={delta => this.nudgeValue(this.state.pc, 'passivePerception', delta)}
						/>
					</Col>
					<Col span={12} className='scrollable'>
						<div className='subheading'>languages:</div>
						<Textbox
							text={this.state.pc.languages}
							onChange={value => this.changeValue(this.state.pc, 'languages', value)}
						/>
						<div className='subheading'>d&d beyond link:</div>
						<Textbox
							text={this.state.pc.url}
							placeholder='https://ddb.ac/characters/...'
							onChange={value => this.changeValue(this.state.pc, 'url', value)}
						/>
						<div className='subheading'>portrait</div>
						<PortraitPanel
							source={this.state.pc}
							setPortrait={data => this.changeValue(this.state.pc, 'portrait', data)}
							clear={() => this.changeValue(this.state.pc, 'portrait', '')}
						/>
						<div className='subheading'>companions:</div>
						{companions}
						<button onClick={() => this.addCompanion()}>add a new companion</button>
					</Col>
					<Drawer visible={this.state.showImageSelection} closable={false} onClose={() => this.toggleImageSelection()}>
						<ImageSelectionModal
							select={id => this.changeValue(this.state.pc, 'portrait', id)}
							cancel={() => this.toggleImageSelection()}
						/>
					</Drawer>
				</Row>
			);
		} catch (e) {
			console.error(e);
			return <div className='render-error'/>;
		}
	}
}
