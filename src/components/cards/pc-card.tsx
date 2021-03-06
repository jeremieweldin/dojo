import { Tag } from 'antd';
import React from 'react';

import { Combatant } from '../../models/combat';
import { PC } from '../../models/party';

import ConfirmButton from '../controls/confirm-button';
import PortraitPanel from '../panels/portrait-panel';

interface Props {
	pc: PC | (PC & Combatant);
	mode: 'view' | 'edit';
	changeValue: (pc: any, field: string, value: any) => void;
	removePC: (pc: PC) => void;
	editPC: (pc: PC) => void;
	updatePC: (pc: PC) => void;
	exportPC: (pc: PC) => void;
}

export default class PCCard extends React.Component<Props> {
	public static defaultProps = {
		mode: 'view',
		changeValue: null,
		removePC: null,
		editPC: null,
		updatePC: null,
		exportPC: null
	};

	public render() {
		try {
			const options = [];
			if (this.props.mode === 'edit') {
				options.push(<button key='edit' onClick={() => this.props.editPC(this.props.pc)}>edit pc</button>);
				if (this.props.pc.url) {
					options.push(<button key='import' onClick={() => this.props.updatePC(this.props.pc)}>update pc from d&amp;d beyond</button>);
				}
				options.push(<button key='export' onClick={() => this.props.exportPC(this.props.pc)}>export pc</button>);
				if (this.props.pc.active) {
					options.push(
						<button key='toggle-active' onClick={() => this.props.changeValue(this.props.pc, 'active', false)}>
							mark pc as inactive
						</button>
					);
				} else {
					options.push(
						<button key='toggle-active' onClick={() => this.props.changeValue(this.props.pc, 'active', true)}>
							mark pc as active
						</button>
					);
				}
				options.push(<ConfirmButton key='remove' text='delete pc' onConfirm={() => this.props.removePC(this.props.pc)} />);
			}

			let companions = null;
			if (this.props.pc.companions.length > 0) {
				companions = this.props.pc.companions.map(companion => (
					<div key={companion.id}>{companion.name}</div>
				));
			}

			const name = (this.props.pc as Combatant ? (this.props.pc as Combatant).displayName : null)
				|| this.props.pc.name
				|| 'unnamed pc';

			return (
				<div className='card pc'>
					<div className='heading'>
						<div className='title' title={name}>
							{name}
						</div>
					</div>
					<div className='card-content'>
						<div className='stats'>
							<PortraitPanel source={this.props.pc} />
							<div className='section centered lowercase'>
								<Tag>{this.props.pc.race || 'unknown race'}</Tag>
								<Tag>{this.props.pc.classes || 'unknown class'}</Tag>
								<Tag>{'level ' + this.props.pc.level}</Tag>
							</div>
							<div className='section centered' style={{ display: this.props.pc.url ? '' : 'none' }}>
								<a href={this.props.pc.url} target='_blank' rel='noopener noreferrer'>d&amp;d beyond sheet</a>
							</div>
							<hr/>
							<div className='section subheading'>size</div>
							<div className='section'>
								{this.props.pc.size}
							</div>
							<div className='section subheading'>languages</div>
							<div className='section'>
								{this.props.pc.languages || '-'}
							</div>
							<div className='section subheading'>passive skills</div>
							<div className='section'>
								<div><b>insight</b> {this.props.pc.passiveInsight}</div>
								<div><b>investigation</b> {this.props.pc.passiveInvestigation}</div>
								<div><b>perception</b> {this.props.pc.passivePerception}</div>
							</div>
							<div style={{ display: this.props.pc.companions.length > 0 ? '' : 'none' }}>
								<div className='section subheading'>companions</div>
								<div className='section'>
									{companions}
								</div>
							</div>
						</div>
						<div style={{ display: options.length > 0 ? '' : 'none' }}>
							<hr/>
							<div className='section'>
								{options}
							</div>
						</div>
					</div>
				</div>
			);
		} catch (e) {
			console.error(e);
			return <div className='render-error'/>;
		}
	}
}
