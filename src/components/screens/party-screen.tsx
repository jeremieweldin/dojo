import { CaretLeftOutlined } from '@ant-design/icons';
import { Col, Row } from 'antd';
import React from 'react';

import Utils from '../../utils/utils';

import { Party, PC } from '../../models/party';

import PCCard from '../cards/pc-card';
import ConfirmButton from '../controls/confirm-button';
import Textbox from '../controls/textbox';
import GridPanel from '../panels/grid-panel';
import Note from '../panels/note';

interface Props {
	party: Party;
	goBack: () => void;
	removeParty: () => void;
	addPC: () => void;
	importPC: () => void;
	editPC: (pc: PC) => void;
	updatePC: (pc: PC) => void;
	removePC: (pc: PC) => void;
	changeValue: (source: any, field: string, value: any) => void;
	nudgeValue: (source: any, field: string, value: number) => void;
}

export default class PartyScreen extends React.Component<Props> {
	private export(pc: PC) {
		const filename = pc.name + '.pc';
		Utils.saveFile(filename, pc);
	}

	public render() {
		try {
			const activePCs = this.props.party.pcs.filter(pc => pc.active);
			const activeCards: JSX.Element[] = [];
			activePCs.forEach(activePC => {
				activeCards.push(
					<PCCard
						pc={activePC}
						mode={'edit'}
						changeValue={(pc, type, value) => this.props.changeValue(pc, type, value)}
						editPC={pc => this.props.editPC(pc)}
						updatePC={pc => this.props.updatePC(pc)}
						exportPC={pc => this.export(pc)}
						removePC={pc => this.props.removePC(pc)}
					/>
				);
			});

			const inactivePCs = this.props.party.pcs.filter(pc => !pc.active);
			const inactiveCards: JSX.Element[] = [];
			inactivePCs.forEach(inactivePC => {
				inactiveCards.push(
					<PCCard
						pc={inactivePC}
						mode={'edit'}
						changeValue={(pc, type, value) => this.props.changeValue(pc, type, value)}
						editPC={pc => this.props.editPC(pc)}
						updatePC={pc => this.props.updatePC(pc)}
						exportPC={pc => this.export(pc)}
						removePC={pc => this.props.removePC(pc)}
					/>
				);
			});

			if (activePCs.length === 0) {
				activeCards.push(
					<Note><div className='section'>there are no pcs in this party</div></Note>
				);
			}

			return (
				<Row className='full-height'>
					<Col xs={12} sm={12} md={8} lg={6} xl={4} className='scrollable sidebar sidebar-left'>
						<PartyInfo
							party={this.props.party}
							goBack={() => this.props.goBack()}
							addPC={() => this.props.addPC()}
							importPC={() => this.props.importPC()}
							changeValue={(type, value) => this.props.changeValue(this.props.party, type, value)}
							removeParty={() => this.props.removeParty()}
						/>
					</Col>
					<Col xs={12} sm={12} md={16} lg={18} xl={20} className='scrollable'>
						<GridPanel
							content={activeCards}
							heading={this.props.party.name || 'unnamed party'}
						/>
						<GridPanel
							content={inactiveCards}
							heading='inactive pcs'
						/>
					</Col>
				</Row>
			);
		} catch (e) {
			console.error(e);
			return <div className='render-error'/>;
		}
	}
}

interface PartyInfoProps {
	party: Party;
	goBack: () => void;
	changeValue: (field: string, value: string) => void;
	addPC: () => void;
	importPC: () => void;
	removeParty: () => void;
}

class PartyInfo extends React.Component<PartyInfoProps> {
	private getSummary() {
		const activePCs = this.props.party.pcs.filter(pc => pc.active);
		if (activePCs.length === 0) {
			return (
				<div className='section centered'>
					<i>no pcs</i>
				</div>
			);
		}

		const level = Math.round(activePCs.reduce((sum, current) => sum + current.level, 0) / activePCs.length);

		const languages = activePCs
			.map(pc => pc.languages)
			.join(', ')
			.split(/[ ,;]+/)
			.reduce((array: string[], value) => {
				if (array.indexOf(value) === -1) {
					array.push(value);
				}
				return array;
			}, [])
			.sort((a, b) => {
				if (a === 'Common') {
					return -1;
				}
				if (b === 'Common') {
					return 1;
				}
				return a.localeCompare(b);
			})
			.join(', ');

		const insight: { min: number | null, max: number | null } = { min: null, max: null };
		const invest: { min: number | null, max: number | null } = { min: null, max: null };
		const percep: { min: number | null, max: number | null } = { min: null, max: null };

		activePCs.forEach(pc => {
			insight.min = insight.min === null ? pc.passiveInsight : Math.min(insight.min, pc.passiveInsight);
			insight.max = insight.max === null ? pc.passiveInsight : Math.max(insight.max, pc.passiveInsight);
			invest.min = invest.min === null ? pc.passiveInvestigation : Math.min(invest.min, pc.passiveInvestigation);
			invest.max = invest.max === null ? pc.passiveInvestigation : Math.max(invest.max, pc.passiveInvestigation);
			percep.min = percep.min === null ? pc.passivePerception : Math.min(percep.min, pc.passivePerception);
			percep.max = percep.max === null ? pc.passivePerception : Math.max(percep.max, pc.passivePerception);
		});

		const insightSummary = insight.min === insight.max ? (insight.min as number).toString() : insight.min + ' - ' + insight.max;
		const investigationSummary = invest.min === invest.max ? (invest.min as number).toString() : invest.min + ' - ' + invest.max;
		const perceptionSummary = percep.min === percep.max ? (percep.min as number).toString() : percep.min + ' - ' + percep.max;

		return (
			<div className='group-panel'>
				<div className='section subheading'>
					average party level
				</div>
				<div className='section'>
					{level}
				</div>
				<div className='section subheading' style={{ display: languages !== '' ? 'block' : 'none' }}>
					party languages
				</div>
				<div className='section'>
					{languages}
				</div>
				<div className='section subheading'>
					party passive skills
				</div>
				<div className='table'>
					<div>
						<div className='cell three'><b>insight</b></div>
						<div className='cell three'><b>invest.</b></div>
						<div className='cell three'><b>percep.</b></div>
					</div>
					<div>
						<div className='cell three'>{insightSummary}</div>
						<div className='cell three'>{investigationSummary}</div>
						<div className='cell three'>{perceptionSummary}</div>
					</div>
				</div>
			</div>
		);
	}

	private export() {
		const filename = this.props.party.name + '.party';
		Utils.saveFile(filename, this.props.party);
	}

	public render() {
		try {
			return (
				<div>
					<div className='section'>
						<div className='subheading'>party name</div>
						<Textbox
							text={this.props.party.name}
							placeholder='party name'
							onChange={value => this.props.changeValue('name', value)}
						/>
					</div>
					<hr/>
					{this.getSummary()}
					<hr/>
					<div className='section'>
						<button onClick={() => this.props.addPC()}>add a new pc</button>
						<button onClick={() => this.props.importPC()}>import a pc</button>
						<button onClick={() => this.export()}>export party</button>
						<ConfirmButton text='delete party' onConfirm={() => this.props.removeParty()} />
						<hr/>
						<button onClick={() => this.props.goBack()}><CaretLeftOutlined style={{ fontSize: '10px' }} /> back to the list</button>
					</div>
				</div>
			);
		} catch (e) {
			console.error(e);
			return <div className='render-error'/>;
		}
	}
}
