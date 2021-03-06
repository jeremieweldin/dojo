import { Carousel, Row } from 'antd';
import React from 'react';

interface Props {
}

export default class HomeScreen extends React.Component<Props> {
	public render() {
		try {
			/* tslint:disable:max-line-length */
			const carousel = (
				<Carousel autoplay={true} autoplaySpeed={10 * 1000}>
					<div key='prologue'>
						<p className='heading'>welcome to <span className='app-name'>dojo</span></p>
						<p><span className='app-name'>dojo</span> is an app for dms of <a href='https://www.wizards.com/dnd' target='_blank' rel='noopener noreferrer'>dungeons and dragons fifth edition</a></p>
						<p>with <span className='app-name'>dojo</span> you can...</p>
					</div>
					<div key='monster'>
						<p className='heading'>build unique, challenging monsters</p>
						<ul>
							<li>watch the stat block change as you design your monster</li>
							<li>see a list of similar monsters to help kickstart your creativity (or show you typical stat values for the type of monster you're creating)</li>
							<li>build an entirely random monster with a single click</li>
							<li>easily import any monster from <a href='https://dnd.wizards.com/articles/features/basicrules' target='_blank' rel='noopener noreferrer'>the basic rules</a> or from <a href='https://www.dndbeyond.com' target='_blank' rel='noopener noreferrer'>d&amp;d beyond</a></li>
							<li>supports legendary and mythic monsters</li>
						</ul>
					</div>
					<div key='encounter'>
						<p className='heading'>create rewarding encounters</p>
						<ul>
							<li>quickly add monsters to your encounter and see its xp value and difficulty level change</li>
							<li>split your encounter into multiple waves</li>
							<li>let <span className='app-name'>dojo</span> build a random encounter on the fly - or use one of its encounter templates to get started</li>
						</ul>
					</div>
					<div key='map'>
						<p className='heading'>design intricate tactical maps</p>
						<ul>
							<li>create a dungeon map by quickly adding rooms, doors, corridors, and stairs</li>
							<li>for something a little more fancy, you can upload your own battlemap images - even animated images</li>
							<li>generate an entire random dungeon map with one click</li>
							<li>add fog of war and then show your maps to your players</li>
						</ul>
					</div>
					<div key='combat'>
						<p className='heading'>run combat without the book-keeping</p>
						<ul>
							<li>see the initiative list at a glance - and share it with players in a separate window</li>
							<li>track monster hit points, rechargable actions, and legendary actions</li>
							<li>track conditions, their durations, and the effects they impose</li>
							<li>easily handle mounted combat</li>
							<li>if you're using a tactical map, <span className='app-name'>dojo</span> keeps track of everyone's location</li>
						</ul>
					</div>
					<div key='session'>
						<p className='heading'>connect with your players</p>
						<ul>
							<li>send messages (or links, or images, or die rolls, or stat blocks) to the whole table - or whisper them to just one player</li>
							<li>during combat, show the initiative order and the encounter map to your players, and let them control their own characters</li>
							<li>each player can update their character's stats, so you don't have to</li>
						</ul>
					</div>
					<div key='epilogue'>
						<p className='heading'>to get started</p>
						<p>use the buttons at the bottom of the screen to explore <span className='app-name'>dojo</span>'s main features</p>
						<p>the arrow at the top right gives you additional tools like a die roller, some useful random generators, and rules references</p>
					</div>
				</Carousel>
			);
			/* tslint:enable:max-line-length */

			return (
				<Row align='middle' justify='center' className='full-height'>
					{carousel}
				</Row>
			);
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}
