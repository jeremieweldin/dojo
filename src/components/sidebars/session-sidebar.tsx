import { CopyOutlined } from '@ant-design/icons';
import React from 'react';

import { Comms, CommsDM } from '../../utils/comms';

import { Combat } from '../../models/combat';
import { Exploration } from '../../models/map';
import { Monster, MonsterGroup } from '../../models/monster';
import { Party } from '../../models/party';

import Checkbox from '../controls/checkbox';
import ConfirmButton from '../controls/confirm-button';
import Dropdown from '../controls/dropdown';
import Selector from '../controls/selector';
import Note from '../panels/note';
import { ConnectionsPanel, MessagesPanel, SendMessagePanel } from '../panels/session-panel';

interface Props {
	parties: Party[];
	library: MonsterGroup[];
	combat: Combat | null;
	exploration: Exploration | null;
	openImage: (data: string) => void;
	openStatBlock: (monster: Monster) => void;
}

interface State {
	view: string;
}

export default class SessionSidebar extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			view: 'management'
		};
	}

	private setView(view: string) {
		this.setState({
			view: view
		});
	}

	private getContent() {
		switch (CommsDM.getState()) {
			case 'not started':
				return this.getNotStartedContent();
			case 'starting':
				return this.getStartingContent();
			case 'started':
				return this.getStartedContent();
		}
	}

	private getNotStartedContent() {
		return (
			<div>
				<Note>
					<p>select a party, then click the 'start' button to allow your players to connect to the game session</p>
					<p>you can then send messages and share combat encounters and map explorations</p>
				</Note>
				<Dropdown
					placeholder='select a party...'
					options={this.props.parties.map(party => ({ id: party.id, text: party.name }))}
					selectedID={Comms.getPartyID()}
					onSelect={id => {
						const party = this.props.parties.find(p => p.id === id);
						CommsDM.setParty(party ?? null);
					}}
				/>
				<button className={Comms.getPartyID() === '' ? 'disabled' : ''} onClick={() => CommsDM.init()}>start the session</button>
			</div>
		);
	}

	private getStartingContent() {
		return (
			<Note>
				<p>starting session...</p>
			</Note>
		);
	}

	private getStartedContent() {
		const playerURL = window.location + (window.location.toString().endsWith('/') ? '' : '/') + 'player';

		switch (this.state.view) {
			case 'messages':
				return (
					<MessagesPanel
						user='dm'
						messages={Comms.data.messages}
						openImage={data => this.props.openImage(data)}
						openStatBlock={monster => this.props.openStatBlock(monster)}
					/>
				);
			case 'people':
				return (
					<ConnectionsPanel
						user='dm'
						people={Comms.data.people}
						kick={id => {
							CommsDM.kick(id);
							this.forceUpdate();
						}}
					/>
				);
			case 'management':
				return (
					<div>
						<Note>
							<p>give your dm code to your players, and ask them to open the player app in their browser</p>
						</Note>
						<div className='generated-item group-panel'>
							<div className='text-section'>
								<p className='smallest'>your dm code for this session:</p>
								<p className='smallest strong'>{Comms.getID()}</p>
							</div>
							<div className='icon-section'>
								<CopyOutlined title='copy to clipboard' onClick={e => navigator.clipboard.writeText(Comms.getID())} />
							</div>
						</div>
						<div className='generated-item group-panel'>
							<div className='text-section'>
								<p className='smallest'>player app url:</p>
								<p className='smallest strong'>{playerURL}</p>
							</div>
							<div className='icon-section'>
								<CopyOutlined title='copy to clipboard' onClick={e => navigator.clipboard.writeText(playerURL)} />
							</div>
						</div>
						<div className='subheading'>options</div>
						<Checkbox
							label='allow players to control their characters'
							checked={Comms.data.options.allowControls}
							onChecked={value => {
								Comms.data.options.allowControls = value;
								this.setState(this.state, () => {
									CommsDM.sendUpdate();
								});
							}}
						/>
						<ConfirmButton
							text='end the session'
							onConfirm={() => CommsDM.shutdown()}
						/>
					</div>
				);
		}

		return null;
	}

	public render() {
		let header = null;
		let footer = null;
		if (CommsDM.getState() === 'started') {
			header = (
				<div className='sidebar-header'>
					<Selector
						options={['messages', 'people', 'management'].map(o => ({ id: o, text: o }))}
						selectedID={this.state.view}
						onSelect={view => this.setView(view)}
					/>
				</div>
			);

			if (this.state.view === 'messages') {
				footer = (
					<div className='sidebar-footer'>
						<SendMessagePanel
							user='dm'
							library={this.props.library}
							openStatBlock={monster => this.props.openStatBlock(monster)}
							sendMessage={(to, text, language, untranslated) => CommsDM.sendMessage(to, text, language, untranslated)}
							sendLink={(to, url) => CommsDM.sendLink(to, url)}
							sendImage={(to, image) => CommsDM.sendImage(to, image)}
							sendRoll={(to, roll) => CommsDM.sendRoll(to, roll)}
							sendMonster={(to, monster) => CommsDM.sendMonster(to, monster)}
						/>
					</div>
				);
			}
		}

		return (
			<div className='sidebar-container'>
				{header}
				<div className='sidebar-content'>
					{this.getContent()}
				</div>
				{footer}
			</div>
		);
	}
}
