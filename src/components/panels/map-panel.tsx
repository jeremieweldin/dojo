import { DownSquareTwoTone, StarTwoTone, UpSquareTwoTone } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React from 'react';
import Showdown from 'showdown';

import Factory from '../../utils/factory';
import Mercator from '../../utils/mercator';
import Utils from '../../utils/utils';

import { Combatant } from '../../models/combat';
import { Map, MapItem, MapNote } from '../../models/map';
import { Monster } from '../../models/monster-group';
import { PC } from '../../models/party';

import HitPointGauge from './hit-point-gauge';

import none from '../../resources/images/no-portrait.png';

const showdown = new Showdown.Converter();
showdown.setOption('tables', true);

interface Props {
	map: Map;
	mode: 'edit' | 'thumbnail' | 'combat' | 'combat-player';
	size: number;
	viewport: MapDimensions | null;
	paddingSquares: number;
	floatingItem: MapItem | null;
	combatants: Combatant[];
	showOverlay: boolean;
	selectedItemIDs: string[];
	fog: { x: number, y: number }[];
	editFog: boolean;
	itemSelected: (itemID: string | null, ctrl: boolean) => void;
	gridSquareEntered: (x: number, y: number) => void;
	gridSquareClicked: (x: number, y: number) => void;
}

interface MapDimensions {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
}

interface MapItemStyle {
	left: string;
	top: string;
	width: string;
	height: string;
	borderRadius: string;
	backgroundSize: string;
	backgroundColor?: string;
	opacity?: string;
}

export default class MapPanel extends React.Component<Props> {
	public static defaultProps = {
		viewport: null,
		paddingSquares: 0,
		floatingItem: null,
		combatants: [],
		showOverlay: false,
		selectedItemIDs: [],
		fog: [],
		editFog: false,
		itemSelected: null,
		gridSquareEntered: null,
		gridSquareClicked: null
	};

	private getMapDimensions(): MapDimensions | null {
		let dimensions: MapDimensions | null = this.props.viewport;

		if (!dimensions) {
			// We haven't been given a viewport, so show all the tiles

			const tiles = this.props.map.items.filter(i => {
				if (this.props.mode === 'edit') {
					return i.type === 'tile';
				}
				return true;
			});

			tiles.forEach(i => {
				if (!dimensions) {
					dimensions = {
						minX: i.x,
						maxX: i.x + i.width - 1,
						minY: i.y,
						maxY: i.y + i.height - 1
					};
				} else {
					dimensions.minX = Math.min(dimensions.minX, i.x);
					dimensions.maxX = Math.max(dimensions.maxX, i.x + i.width - 1);
					dimensions.minY = Math.min(dimensions.minY, i.y);
					dimensions.maxY = Math.max(dimensions.maxY, i.y + i.height - 1);
				}
			});
		}

		if (this.props.combatants) {
			this.props.combatants.filter(c => c.aura.radius > 0).forEach(c => {
				const mi = this.props.map.items.find(i => i.id === c.id);
				if (mi) {
					const sizeInSquares = c.aura.radius / 5;
					let miniSize = 1;
					const m = c as Combatant & Monster;
					if (m) {
						miniSize = Math.max(Utils.miniSize(m.size), 1);
					}
					const minX = mi.x - sizeInSquares;
					const maxX = mi.x + (miniSize - 1) + sizeInSquares;
					const minY = mi.y - sizeInSquares;
					const maxY = mi.y + (miniSize - 1) + sizeInSquares;

					if (dimensions) {
						dimensions.minX = Math.min(dimensions.minX, minX);
						dimensions.maxX = Math.max(dimensions.maxX, maxX);
						dimensions.minY = Math.min(dimensions.minY, minY);
						dimensions.maxY = Math.max(dimensions.maxY, maxY);
					}
				}
			});
		}

		if (!dimensions) {
			// The map is blank
			if (this.props.mode === 'thumbnail') {
				return null;
			}

			dimensions = {
				minX: 0,
				maxX: 0,
				minY: 0,
				maxY: 0
			};
		}

		// Apply the border
		dimensions.minX -= this.props.paddingSquares;
		dimensions.maxX += this.props.paddingSquares;
		dimensions.minY -= this.props.paddingSquares;
		dimensions.maxY += this.props.paddingSquares;

		return dimensions;
	}

	private getStyle(x: number, y: number, width: number, height: number, style: 'square' | 'rounded' | 'circle' | null, dim: MapDimensions): MapItemStyle {
		let offsetX = 0;
		let offsetY = 0;
		if (width < 1) {
			offsetX = (1 - width) / 2;
		}
		if (height < 1) {
			offsetY = (1 - height) / 2;
		}

		let radius = '0';
		switch (style) {
			case 'rounded':
				radius = this.props.size + 'px';
				break;
			case 'circle':
				radius = '50%';
				break;
		}

		return {
			left: 'calc(' + this.props.size + 'px * ' + (x + offsetX - dim.minX) + ')',
			top: 'calc(' + this.props.size + 'px * ' + (y + offsetY - dim.minY) + ')',
			width: 'calc((' + this.props.size + 'px * ' + width + ') + 1px)',
			height: 'calc((' + this.props.size + 'px * ' + height + ') + 1px)',
			borderRadius: radius,
			backgroundSize: this.props.size + 'px'
		};
	}

	public render() {
		try {
			const mapDimensions = this.getMapDimensions();
			if (!mapDimensions) {
				return (
					<div className='section centered'>(blank map)</div>
				);
			}

			let items: MapItem[] = [];
			items = items.concat(this.props.map.items);
			if (this.props.floatingItem) {
				items.push(this.props.floatingItem);
			}

			// Draw the map tiles
			const tiles = items
				.filter(i => i.type === 'tile')
				.map(i => {
					const tileStyle = this.getStyle(i.x, i.y, i.width, i.height, i.style, mapDimensions);
					return (
						<MapTile
							key={i.id}
							tile={i}
							note={this.props.mode !== 'combat-player' ? Mercator.getNote(this.props.map, i) : null}
							style={tileStyle}
							selectable={this.props.mode === 'edit'}
							selected={this.props.selectedItemIDs.includes(i.id)}
							select={(id, ctrl) => this.props.mode === 'edit' ? this.props.itemSelected(id, ctrl) : null}
						/>
					);
				});

			// Draw fog of war
			let fog: JSX.Element[] = [];
			if (this.props.mode !== 'edit') {
				fog = this.props.fog
					.map(f => {
						const fogStyle = this.getStyle(f.x, f.y, 1, 1, 'square', mapDimensions);
						return (
							<GridSquare
								key={f.x + ',' + f.y}
								x={f.x}
								y={f.y}
								style={fogStyle}
								mode='fog'
							/>
						);
					});
			}

			// Draw overlays
			let overlays: JSX.Element[] = [];
			if ((this.props.mode !== 'edit') && (this.props.mode !== 'thumbnail')) {
				overlays = items
					.filter(i => i.type === 'overlay')
					.map(i => {
						const overlayStyle = this.getStyle(i.x, i.y, i.width, i.height, i.style, mapDimensions);
						overlayStyle.backgroundColor = i.color + i.opacity.toString(16);
						return (
							<MapOverlay
								key={i.id}
								overlay={i}
								note={this.props.mode !== 'combat-player' ? Mercator.getNote(this.props.map, i) : null}
								style={overlayStyle}
								selected={this.props.selectedItemIDs.includes(i.id)}
								select={(id, ctrl) => this.props.itemSelected(id, ctrl)}
							/>
						);
					});
			}

			// Draw token auras
			let auras: JSX.Element[] = [];
			if ((this.props.mode !== 'edit') && (this.props.mode !== 'thumbnail')) {
				auras = this.props.combatants
					.filter(c => c.aura.radius > 0)
					.filter(c => c.showOnMap || (this.props.mode !== 'combat-player'))
					.map(c => {
						const mi = items.find(i => i.id === c.id);
						if (mi) {
							const sizeInSquares = c.aura.radius / 5;
							const miniSize = Math.max(Utils.miniSize(c.displaySize), 1);
							const dim = (sizeInSquares * 2) + miniSize;
							const auraStyle = this.getStyle(mi.x - sizeInSquares, mi.y - sizeInSquares, dim, dim, c.aura.style, mapDimensions);
							auraStyle.backgroundColor = c.aura.color;
							return (
								<div
									key={c.id + ' aura'}
									className={'aura'}
									style={auraStyle}
								/>
							);
						}
						return null;
					})
					.filter(mt => mt !== null) as JSX.Element[];
			}

			// Draw the tokens
			let tokens: JSX.Element[] = [];
			if (this.props.mode !== 'edit') {
				const mountIDs = this.props.combatants.map(c => c.mountID || '').filter(id => id !== '');
				tokens = items
					.filter(i => (i.type === 'monster') || (i.type === 'pc') || (i.type === 'companion') || (i.type === 'token'))
					.filter(i => !mountIDs.includes(i.id))
					.map(i => {
						let miniSize = Utils.miniSize(i.size);
						let note = Mercator.getNote(this.props.map, i);
						let isPC = false;
						const combatant = this.props.combatants.find(c => c.id === i.id);
						if (combatant) {
							let s = combatant.displaySize;
							if (combatant.mountID) {
								const mount = this.props.combatants.find(m => m.id === combatant.mountID);
								if (mount) {
									s = mount.displaySize;
								}
							}
							miniSize = Utils.miniSize(s);
							if (!note && combatant.note) {
								note = Factory.createMapNote();
								note.targetID = combatant.id;
								note.text = combatant.note;
							}
							isPC = (combatant.type === 'pc');
						}
						const tokenStyle = this.getStyle(i.x, i.y, miniSize, miniSize, 'circle', mapDimensions);
						return (
							<MapToken
								key={i.id}
								token={i}
								note={this.props.mode !== 'combat-player' ? note : null}
								combatant={combatant || null}
								style={tokenStyle}
								simple={this.props.mode === 'thumbnail'}
								showGauge={this.props.mode === 'combat'}
								showHidden={(this.props.mode === 'combat') || isPC}
								selectable={(this.props.mode === 'combat') || (this.props.mode === 'combat-player')}
								selected={this.props.selectedItemIDs.includes(i.id)}
								select={(id, ctrl) => this.props.itemSelected(id, ctrl)}
							/>
						);
					})
					.filter(mt => mt !== null) as JSX.Element[];
			}

			// Draw the drag overlay
			const dragOverlay = [];
			if (this.props.showOverlay || this.props.editFog) {
				for (let yOver = mapDimensions.minY; yOver !== mapDimensions.maxY + 1; ++yOver) {
					for (let xOver = mapDimensions.minX; xOver !== mapDimensions.maxX + 1; ++xOver) {
						const overlayStyle = this.getStyle(xOver, yOver, 1, 1, 'square', mapDimensions);
						dragOverlay.push(
							<GridSquare
								key={xOver + ',' + yOver}
								x={xOver}
								y={yOver}
								style={overlayStyle}
								mode={this.props.editFog ? 'fog-overlay' : 'drag-overlay'}
								onMouseEnter={(posX, posY) => this.props.gridSquareEntered(posX, posY)}
								onClick={(posX, posY) => this.props.gridSquareClicked(posX, posY)}
							/>
						);
					}
				}
			}

			const style = 'map-panel ' + this.props.mode;
			const mapWidth = 1 + mapDimensions.maxX - mapDimensions.minX;
			const mapHeight = 1 + mapDimensions.maxY - mapDimensions.minY;
			return (
				<div className={style} onClick={() => this.props.itemSelected ? this.props.itemSelected(null, false) : null}>
					<div className='grid' style={{ width: ((this.props.size * mapWidth) + 2) + 'px', height: ((this.props.size * mapHeight) + 2) + 'px' }}>
						{tiles}
						{fog}
						{overlays}
						{auras}
						{tokens}
						{dragOverlay}
					</div>
				</div>
			);
		} catch (e) {
			console.error(e);
			return <div className='render-error'/>;
		}
	}
}

interface GridSquareProps {
	x: number;
	y: number;
	style: MapItemStyle;
	mode: 'drag-overlay' | 'fog-overlay' | 'fog';
	onMouseEnter: (x: number, y: number) => void;
	onClick: (x: number, y: number) => void;
	onDoubleClick: (x: number, y: number) => void;
}

class GridSquare extends React.Component<GridSquareProps> {
	public static defaultProps = {
		onMouseEnter: null,
		onClick: null,
		onDoubleClick: null
	};

	private mouseEnter(e: React.MouseEvent) {
		e.stopPropagation();
		if (this.props.onMouseEnter) {
			this.props.onMouseEnter(this.props.x, this.props.y);
		}
	}

	private click(e: React.MouseEvent, type: 'single' | 'double') {
		e.stopPropagation();
		if ((type === 'single') && this.props.onClick) {
			this.props.onClick(this.props.x, this.props.y);
		}
		if ((type === 'double') && this.props.onDoubleClick) {
			this.props.onDoubleClick(this.props.x, this.props.y);
		}
	}

	public render() {
		try {
			return (
				<div
					className={'grid-square ' + this.props.mode}
					style={this.props.style}
					onMouseEnter={e => this.mouseEnter(e)}
					onClick={e => this.click(e, 'single')}
					onDoubleClick={e => this.click(e, 'double')}
				/>
			);
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}

interface MapTileProps {
	tile: MapItem;
	note: MapNote | null;
	style: MapItemStyle;
	selectable: boolean;
	selected: boolean;
	select: (tileID: string, ctrl: boolean) => void;
}

class MapTile extends React.Component<MapTileProps> {
	private select(e: React.MouseEvent) {
		if (this.props.selectable) {
			e.stopPropagation();
			this.props.select(this.props.tile.id, e.ctrlKey);
		}
	}

	private getNoteText() {
		if (this.props.note) {
			return this.props.note.text.trim();
		}

		return '';
	}

	public render() {
		try {
			let style = 'tile ' + this.props.tile.terrain;
			if (this.props.selected) {
				style += ' selected';
			}

			let customImage = null;
			if (this.props.tile.terrain === 'custom') {
				let src = none;
				const data = localStorage.getItem('image-' + this.props.tile.customBackground);
				if (data) {
					const image = JSON.parse(data);
					src = image.data;
				}
				customImage = (
					<img className='custom-image' alt='map tile' src={src} />
				);
			}

			let content = null;
			if (this.props.tile.content) {
				switch (this.props.tile.content.type) {
					case 'doorway':
						switch (this.props.tile.content.style) {
							case 'single':
								switch (this.props.tile.content.orientation) {
									case 'horizontal':
										content = (
											<svg className='tile-content'>
												<line className='thick' x1='0' y1='50%' x2='100%' y2='50%' />
												<rect className='thin outline' x='10%' y='25%' width='80%' height='50%' />
											</svg>
										);
										break;
									case 'vertical':
										content = (
											<svg className='tile-content'>
												<line className='thick' x1='50%' y1='0' x2='50%' y2='100%' />
												<rect className='thin outline' x='25%' y='10%' width='50%' height='80%' />
											</svg>
										);
										break;
								}
								break;
							case 'double':
								switch (this.props.tile.content.orientation) {
									case 'horizontal':
										content = (
											<svg className='tile-content'>
												<line className='thick' x1='0' y1='50%' x2='100%' y2='50%' />
												<rect className='thin outline' x='10%' y='25%' width='80%' height='50%' />
												<line className='thin' x1='50%' y1='25%' x2='50%' y2='75%' />
											</svg>
										);
										break;
									case 'vertical':
										content = (
											<svg className='tile-content'>
												<line className='thick' x1='50%' y1='0' x2='50%' y2='100%' />
												<rect className='thin outline' x='25%' y='10%' width='50%' height='80%' />
												<line className='thin' x1='25%' y1='50%' x2='75%' y2='50%' />
											</svg>
										);
										break;
								}
								break;
							case 'arch':
								switch (this.props.tile.content.orientation) {
									case 'horizontal':
										content = (
											<svg className='tile-content'>
												<line className='thick' x1='0' y1='50%' x2='20%' y2='50%' />
												<line className='thick' x1='80%' y1='50%' x2='100%' y2='50%' />
												<line className='medium' x1='20%' y1='20%' x2='20%' y2='80%' />
												<line className='medium' x1='80%' y1='20%' x2='80%' y2='80%' />
											</svg>
										);
										break;
									case 'vertical':
										content = (
											<svg className='tile-content'>
												<line className='thick' x1='50%' y1='0' x2='50%' y2='20%' />
												<line className='thick' x1='50%' y1='80%' x2='50%' y2='100%' />
												<line className='medium' x1='20%' y1='20%' x2='80%' y2='20%' />
												<line className='medium' x1='20%' y1='80%' x2='80%' y2='80%' />
											</svg>
										);
										break;
								}
								break;
							case 'bars':
								switch (this.props.tile.content.orientation) {
									case 'horizontal':
										content = (
											<svg className='tile-content'>
												<circle className='thin filled' cx='10%' cy='50%' r='5%' />
												<circle className='thin filled' cx='30%' cy='50%' r='5%' />
												<circle className='thin filled' cx='50%' cy='50%' r='5%' />
												<circle className='thin filled' cx='70%' cy='50%' r='5%' />
												<circle className='thin filled' cx='90%' cy='50%' r='5%' />
											</svg>
										);
										break;
									case 'vertical':
										content = (
											<svg className='tile-content'>
												<circle className='thin filled' cx='50%' cy='10%' r='5%' />
												<circle className='thin filled' cx='50%' cy='30%' r='5%' />
												<circle className='thin filled' cx='50%' cy='50%' r='5%' />
												<circle className='thin filled' cx='50%' cy='70%' r='5%' />
												<circle className='thin filled' cx='50%' cy='90%' r='5%' />
											</svg>
										);
										break;
								}
								break;
						}
						break;
					case 'stairway':
						switch (this.props.tile.content.style) {
							case 'stairs':
								switch (this.props.tile.content.orientation) {
									case 'horizontal':
										content = (
											<svg className='tile-content'>
												<line className='thin' x1='0' y1='12.5%' x2='100%' y2='12.5%' />
												<line className='thin' x1='0' y1='25%' x2='100%' y2='25%' />
												<line className='thin' x1='0' y1='37.5%' x2='100%' y2='37.5%' />
												<line className='thin' x1='0' y1='50%' x2='100%' y2='50%' />
												<line className='thin' x1='0' y1='62.5%' x2='100%' y2='62.5%' />
												<line className='thin' x1='0' y1='75%' x2='100%' y2='75%' />
												<line className='thin' x1='0' y1='87.5%' x2='100%' y2='87.5%' />
											</svg>
										);
										break;
									case 'vertical':
										content = (
											<svg className='tile-content'>
												<line className='thin' x1='12.5%' y1='0' x2='12.5%' y2='100%' />
												<line className='thin' x1='25%' y1='0' x2='25%' y2='100%' />
												<line className='thin' x1='37.5%' y1='0' x2='37.5%' y2='100%' />
												<line className='thin' x1='50%' y1='0' x2='50%' y2='100%' />
												<line className='thin' x1='62.5%' y1='0' x2='62.5%' y2='100%' />
												<line className='thin' x1='75%' y1='0' x2='75%' y2='100%' />
												<line className='thin' x1='87.5%' y1='0' x2='87.5%' y2='100%' />
											</svg>
										);
										break;
								}
								break;
							case 'spiral':
								content = (
									<svg className='tile-content'>
										<ellipse className='thin outline' cx='50%' cy='50%' rx='40%' ry='40%' />
										<ellipse className='thin filled' cx='50%' cy='50%' rx='10%' ry='10%' />
										<line className='thin' x1='50%' y1='10%' x2='50%' y2='90%' />
										<line className='thin' x1='10%' y1='50%' x2='90%' y2='50%' />
										<line className='thin' x1='20%' y1='20%' x2='80%' y2='80%' />
										<line className='thin' x1='20%' y1='80%' x2='80%' y2='20%' />
									</svg>
								);
								break;
							case 'ladder':
								switch (this.props.tile.content.orientation) {
									case 'horizontal':
										content = (
											<svg className='tile-content'>
												<circle className='thin filled' cx='20%' cy='50%' r='7%' />
												<line className='thin' x1='20%' y1='50%' x2='80%' y2='50%' />
												<circle className='thin filled' cx='80%' cy='50%' r='7%' />
											</svg>
										);
										break;
									case 'vertical':
										content = (
											<svg className='tile-content'>
												<circle className='thin filled' cx='50%' cy='20%' r='7%' />
												<line className='thin' x1='50%' y1='20%' x2='50%' y2='80%' />
												<circle className='thin filled' cx='50%' cy='80%' r='7%' />
											</svg>
										);
										break;
								}
								break;
						}
						break;
				}
			}

			const tile = (
				<div
					className={style}
					style={this.props.style}
					onClick={e => this.select(e)}
				>
					{customImage}
					{content}
				</div>
			);

			const noteText = this.getNoteText();
			if (noteText) {
				return (
					<Tooltip placement='bottom' title={<div dangerouslySetInnerHTML={{ __html: showdown.makeHtml(noteText) }} />}>
						{tile}
					</Tooltip>
				);
			} else {
				return tile;
			}
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}

interface MapOverlayProps {
	overlay: MapItem;
	note: MapNote | null;
	style: MapItemStyle;
	selected: boolean;
	select: (tileID: string, ctrl: boolean) => void;
}

class MapOverlay extends React.Component<MapOverlayProps> {
	private select(e: React.MouseEvent) {
		e.stopPropagation();
		this.props.select(this.props.overlay.id, e.ctrlKey);
	}

	private getNoteText() {
		if (this.props.note) {
			return this.props.note.text.trim();
		}

		return '';
	}

	public render() {
		try {
			let style = 'overlay';
			if (this.props.selected) {
				style += ' selected';
			}

			const overlay = (
				<div
					className={style}
					style={this.props.style}
					onClick={e => this.select(e)}
				/>
			);

			const noteText = this.getNoteText();
			if (noteText) {
				return (
					<Tooltip placement='bottom' title={<div dangerouslySetInnerHTML={{ __html: showdown.makeHtml(noteText) }} />}>
						{overlay}
					</Tooltip>
				);
			} else {
				return overlay;
			}
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}

interface MapTokenProps {
	token: MapItem;
	note: MapNote | null;
	combatant: Combatant | null;
	style: MapItemStyle;
	simple: boolean;
	showGauge: boolean;
	showHidden: boolean;
	selectable: boolean;
	selected: boolean;
	select: (tokenID: string, ctrl: boolean) => void;
}

class MapToken extends React.Component<MapTokenProps> {
	private select(e: React.MouseEvent) {
		if (this.props.selectable) {
			e.stopPropagation();
			this.props.select(this.props.token.id, e.ctrlKey);
		}
	}

	private getNoteText() {
		let noteText = this.props.combatant ? '**' + this.props.combatant.displayName + '**' : '';

		if (this.props.combatant) {
			if (!this.props.combatant.showOnMap) {
				noteText += '\n\n';
				noteText += '**hidden**';
			}

			this.props.combatant.tags.forEach(tag => {
				noteText += '\n\n';
				noteText += '**' + Utils.getTagTitle(tag) + '**';
				noteText += '\n\n';
				noteText += '* ' + Utils.getTagDescription(tag);
			});

			this.props.combatant.conditions.forEach(condition => {
				noteText += '\n\n';
				noteText += '**' + condition.name + '**';
				Utils.conditionText(condition).forEach(txt => {
					noteText += '\n\n';
					noteText += '* ' + txt;
				});
			});
		}

		if (this.props.note && this.props.note.text) {
			noteText += '\n\n';
			noteText += this.props.note.text;
		}

		return noteText.trim();
	}

	public render() {
		try {
			let name = 'token';
			let style = 'token';

			if (this.props.selected) {
				style += ' selected';
			}

			if (this.props.combatant) {
				name = this.props.combatant.displayName || 'combatant';
				style += ' ' + this.props.combatant.type;

				if (this.props.combatant.current) {
					style += ' current';
				}
				if (!this.props.combatant.showOnMap) {
					if (this.props.showHidden) {
						style += ' hidden';
					} else {
						return null;
					}
				}
			}

			let content = null;
			let hpGauge = null;
			let altitudeBadge = null;
			let conditionsBadge = null;
			if (this.props.combatant && !this.props.simple) {
				let src = '';
				const c = this.props.combatant as (Combatant & PC) | (Combatant & Monster);
				if (c && c.portrait) {
					const data = localStorage.getItem('image-' + c.portrait);
					if (data) {
						const image = JSON.parse(data);
						src = image.data;
					}
				}

				if (src) {
					content = (
						<img className='portrait' src={src} alt={name} />
					);
				} else {
					const inits = name.toUpperCase()
									.replace(/[^A-Z0-9 ]/, '')
									.split(' ')
									.map(s => s[0])
									.join('');
					content = (
						<div className='initials'>{inits}</div>
					);
				}

				if (this.props.combatant.type === 'monster' && this.props.showGauge) {
					const current = this.props.combatant.hpCurrent || 0;
					const max = this.props.combatant.hpMax || 0;
					if (current < max) {
						hpGauge = (
							<HitPointGauge combatant={this.props.combatant} />
						);
					}
				}

				if (this.props.combatant.altitude > 0) {
					altitudeBadge = (
						<div className='badge'>
							<UpSquareTwoTone twoToneColor='#3c78dc' />
						</div>
					);
				}

				if (this.props.combatant.altitude < 0) {
					altitudeBadge = (
						<div className='badge'>
							<DownSquareTwoTone twoToneColor='#3c78dc' />
						</div>
					);
				}

				let things = 0;
				if (this.props.combatant.conditions) {
					things += this.props.combatant.conditions.length;
				}
				if (this.props.combatant.tags) {
					things += this.props.combatant.tags
						.filter(t => !t.startsWith('engaged'))
						.length;
				}
				if (things > 0) {
					conditionsBadge = (
						<div className='conditions'>
							<StarTwoTone twoToneColor='#3c78dc' />
						</div>
					);
				}
			}

			const token = (
				<div
					className={style}
					style={this.props.style}
					onClick={e => this.select(e)}
				>
					{content}
					{hpGauge}
					{altitudeBadge}
					{conditionsBadge}
				</div>
			);

			const noteText = this.getNoteText();
			if (noteText) {
				return (
					<Tooltip placement='bottom' title={<div dangerouslySetInnerHTML={{ __html: showdown.makeHtml(noteText) }} />}>
						{token}
					</Tooltip>
				);
			} else {
				return token;
			}
		} catch (ex) {
			console.error(ex);
			return <div className='render-error'/>;
		}
	}
}
