import React from 'react';

import { Col, Row, Slider } from 'antd';

import Factory from '../../utils/factory';
import Napoleon from '../../utils/napoleon';
import Utils from '../../utils/utils';

import { Combat, Combatant, Notification } from '../../models/combat';
import { Condition, ConditionDurationSaves } from '../../models/condition';
import { Encounter } from '../../models/encounter';
import { MapItem } from '../../models/map-folio';
import { Monster, Trait } from '../../models/monster-group';
import { PC } from '../../models/party';

import MonsterCard from '../cards/monster-card';
import PCCard from '../cards/pc-card';
import Checkbox from '../controls/checkbox';
import ConfirmButton from '../controls/confirm-button';
import NumberSpin from '../controls/number-spin';
import Radial from '../controls/radial';
import Selector from '../controls/selector';
import GridPanel from '../panels/grid-panel';
import HitPointGauge from '../panels/hit-point-gauge';
import MapPanel from '../panels/map-panel';
import Note from '../panels/note';
import Popout from '../panels/popout';
import PortraitPanel from '../panels/portrait-panel';
import TraitsPanel from '../panels/traits-panel';

interface Props {
    combat: Combat;
    encounters: Encounter[];
    pauseCombat: () => void;
    endCombat: () => void;
    closeNotification: (notification: Notification, removeCondition: boolean) => void;
    mapAdd: (combatant: Combatant, x: number, y: number) => void;
    makeCurrent: (combatant: Combatant) => void;
    makeActive: (combatant: Combatant) => void;
    makeDefeated: (combatant: Combatant) => void;
    removeCombatant: (combatant: Combatant) => void;
    addCombatants: () => void;
    addWave: () => void;
    addCondition: (combatant: Combatant) => void;
    editCondition: (combatant: Combatant, condition: Condition) => void;
    removeCondition: (combatant: Combatant, conditionID: string) => void;
    mapMove: (id: string, dir: string) => void;
    mapResize: (id: string, dir: string, dir2: 'out' | 'in') => void;
    mapRemove: (id: string) => void;
    endTurn: (combatant: Combatant) => void;
    changeHP: (combatant: Combatant & Monster, hp: number, temp: number) => void;
    changeValue: (source: {}, type: string, value: any) => void;
    nudgeValue: (source: {}, type: string, delta: number) => void;
    toggleTag: (combatant: Combatant, tag: string) => void;
    toggleCondition: (combatant: Combatant, condition: string) => void;
    scatterCombatants: (type: 'pc' | 'monster') => void;
    rotateMap: () => void;
    addOverlay: (overlay: MapItem) => void;
}

interface State {
    showTools: boolean;
    selectedItemID: string | null;
    addingToMapID: string | null;
    addingOverlay: boolean;
    mapSize: number;
    playerView: {
        open: boolean;
        showControls: boolean;
        mapSize: number;
    };
}

export default class CombatScreen extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showTools: false,
            selectedItemID: null,   // The ID of the combatant or map item (overlay) that's selected
            addingToMapID: null,    // The ID of the combatant we're adding to the map
            addingOverlay: false,   // True if we're adding a custom overlay to the map
            mapSize: 30,
            playerView: {
                open: false,
                showControls: false,
                mapSize: 30
            }
        };
    }

    public componentDidMount() {
        window.addEventListener('beforeunload', () => {
            this.setPlayerViewOpen(false);
        });
    }

    private toggleTools() {
        this.setState({
            showTools: !this.state.showTools
        });
    }

    private setSelectedItemID(id: string | null) {
        this.setState({
            selectedItemID: id
        });
    }

    private setAddingToMapID(id: string | null) {
        this.setState({
            addingToMapID: id,
            addingOverlay: false
        });
    }

    private toggleAddingOverlay() {
        this.setState({
            addingOverlay: !this.state.addingOverlay,
            addingToMapID: null
        });
    }

    private nudgeMapSize(value: number) {
        this.setState({
            mapSize: this.state.mapSize + value
        });
    }

    private setPlayerViewOpen(show: boolean) {
        // eslint-disable-next-line
        this.state.playerView.open = show;
        this.setState({
            playerView: this.state.playerView
        });
    }

    private setPlayerViewShowControls(show: boolean) {
        // eslint-disable-next-line
        this.state.playerView.showControls = show;
        this.setState({
            playerView: this.state.playerView
        });
    }

    private nudgePlayerViewMapSize(value: number) {
        // eslint-disable-next-line
        this.state.playerView.mapSize = this.state.playerView.mapSize + value;
        this.setState({
            playerView: this.state.playerView
        });
    }

    private nextTurn() {
        const current = this.props.combat.combatants.find(c => c.current);
        if (current) {
            this.props.endTurn(current);
        } else {
            const first = this.props.combat.combatants.find(c => c.active);
            if (first) {
                this.props.makeCurrent(first);
            }
        }
    }

    private getPlayerView(combat: Combat) {
        if (!this.state.playerView.open) {
            return null;
        }

        const init = combat.combatants
            .filter(c => c.showOnMap)
            .filter(combatant => !combatant.pending && combatant.active && !combatant.defeated)
            .map(combatant => {
                switch (combatant.type) {
                    case 'pc':
                        return (
                            <PCRow
                                key={combatant.id}
                                combatant={combatant as Combatant & PC}
                                minimal={true}
                                combat={this.props.combat as Combat}
                                select={c => this.setSelectedItemID(c.id)}
                                selected={combatant.id === this.state.selectedItemID}
                            />
                        );
                    case 'monster':
                        return (
                            <MonsterRow
                                key={combatant.id}
                                combatant={combatant as Combatant & Monster}
                                minimal={true}
                                combat={this.props.combat as Combat}
                                select={c => this.setSelectedItemID(c.id)}
                                selected={combatant.id === this.state.selectedItemID}
                            />
                        );
                    default:
                        return null;
                }
            });

        if (combat.map) {
            let controls = null;
            if (combat.map && this.state.playerView.showControls) {
                let selection = combat.combatants
                    .filter(c => combat.map !== null ? combat.map.items.find(item => item.id === c.id) : false)
                    .filter(c => c.showOnMap)
                    .find(c => c.id === this.state.selectedItemID);
                if (!selection) {
                    selection = combat.combatants
                        .filter(c => combat.map !== null ? combat.map.items.find(item => item.id === c.id) : false)
                        .filter(c => c.showOnMap)
                        .find(c => c.current);
                }

                if (selection) {
                    const token = selection as ((Combatant & PC) | (Combatant & Monster));
                    controls = (
                        <div>
                            <div className='heading lowercase'>{token.displayName}</div>
                            <div className='section centered'>
                                <Radial
                                    direction='eight'
                                    click={dir => this.props.mapMove(token.id, dir)}
                                />
                            </div>
                            <div className='divider' />
                            <NumberSpin
                                key='altitude'
                                source={token}
                                name='altitude'
                                label='altitude'
                                display={value => value + ' ft.'}
                                nudgeValue={delta => this.props.nudgeValue(token, 'altitude', delta * 5)}
                            />
                            <Row gutter={10}>
                                <Col span={8}>
                                    <Checkbox
                                        label='conc.'
                                        display='button'
                                        checked={token.tags.includes('conc')}
                                        changeValue={value => this.props.toggleTag(token, 'conc')}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Checkbox
                                        label='bane'
                                        display='button'
                                        checked={token.tags.includes('bane')}
                                        changeValue={value => this.props.toggleTag(token, 'bane')}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Checkbox
                                        label='bless'
                                        display='button'
                                        checked={token.tags.includes('bless')}
                                        changeValue={value => this.props.toggleTag(token, 'bless')}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={10}>
                                <Col span={8}>
                                    <Checkbox
                                        label='prone'
                                        display='button'
                                        checked={token.conditions.some(c => c.name === 'prone')}
                                        changeValue={value => this.props.toggleCondition(token, 'prone')}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Checkbox
                                        label='uncon.'
                                        display='button'
                                        checked={token.conditions.some(c => c.name === 'unconscious')}
                                        changeValue={value => this.props.toggleCondition(token, 'unconscious')}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Checkbox
                                        label='hidden'
                                        display='button'
                                        checked={!token.showOnMap}
                                        changeValue={value => this.props.changeValue(token, 'showOnMap', !value)}
                                    />
                                </Col>
                            </Row>
                        </div>
                    );
                }
            }

            return (
                <Popout title='Encounter' closeWindow={() => this.setPlayerViewOpen(false)}>
                    <Row>
                        <Col xs={24} sm={24} md={12} lg={16} xl={18} className='scrollable both-ways'>
                            <MapPanel
                                key='map'
                                map={combat.map}
                                mode='combat-player'
                                size={this.state.playerView.mapSize}
                                combatants={combat.combatants}
                                selectedItemID={this.state.selectedItemID ? this.state.selectedItemID : undefined}
                                setSelectedItemID={id => this.setSelectedItemID(id)}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8} xl={6} className='scrollable'>
                            {controls}
                            <div className='heading fixed-top'>initiative order</div>
                            {init}
                        </Col>
                    </Row>
                </Popout>
            );
        } else {
            return (
                <Popout title='Encounter' closeWindow={() => this.setPlayerViewOpen(false)}>
                    <div className='scrollable'>
                        <div className='heading'>initiative order</div>
                        {init}
                    </div>
                </Popout>
            );
        }
    }

    private getTools() {
        let wavesAvailable = false;
        const encounterID = this.props.combat.encounterID;
        const encounter = this.props.encounters.find(enc => enc.id === encounterID);
        wavesAvailable = !!encounter && (encounter.waves.length > 0);

        return (
            <div>
                <div className='subheading'>encounter</div>
                <button onClick={() => this.props.pauseCombat()}>pause combat</button>
                <ConfirmButton text='end combat' callback={() => this.props.endCombat()} />
                <div className='subheading'>combatants</div>
                <button onClick={() => this.props.addCombatants()}>add combatants</button>
                <button onClick={() => this.props.addWave()} style={{ display: wavesAvailable ? 'block' : 'none' }}>add wave</button>
                <div style={{ display: this.props.combat.map ? 'block' : 'none' }}>
                    <div className='subheading'>map</div>
                    <button onClick={() => this.props.scatterCombatants('monster')}>scatter monsters</button>
                    <button onClick={() => this.props.scatterCombatants('pc')}>scatter pcs</button>
                    <Checkbox
                        label={this.state.addingOverlay ? 'click on the map to add the item, or click here to cancel' : 'add token / overlay'}
                        display='button'
                        checked={this.state.addingOverlay}
                        changeValue={() => this.toggleAddingOverlay()}
                    />
                    <NumberSpin
                        source={this.state}
                        name={'mapSize'}
                        display={() => 'zoom'}
                        nudgeValue={delta => this.nudgeMapSize(delta * 5)}
                    />
                </div>
                <div className='subheading'>player view</div>
                <Checkbox
                    label='show player view'
                    checked={this.state.playerView.open}
                    changeValue={value => this.setPlayerViewOpen(value)}
                />
                <div style={{ display: this.props.combat.map ? 'block' : 'none' }}>
                    <Checkbox
                        label='show map controls'
                        checked={this.state.playerView.showControls}
                        changeValue={value => this.setPlayerViewShowControls(value)}
                    />
                </div>
                <div style={{ display: (this.props.combat.map && this.state.playerView.open) ? 'block' : 'none' }}>
                    <NumberSpin
                        source={this.state.playerView}
                        name={'mapSize'}
                        display={() => 'zoom'}
                        nudgeValue={delta => this.nudgePlayerViewMapSize(delta * 5)}
                    />
                </div>
            </div>
        );
    }

    private getSelectedCombatant() {
        let selectedCombatant = null;
        if (this.state.selectedItemID) {
            const combatant = this.props.combat.combatants.find(c => c.id === this.state.selectedItemID);
            if (combatant) {
                if (combatant.current) {
                    selectedCombatant = (
                        <Note key='selected'>
                            <div className='section'>
                                <b>{combatant.displayName}</b> is selected; it is the current initiative holder
                            </div>
                        </Note>
                    );
                } else {
                    selectedCombatant = this.createCard(combatant);
                }
            }

            if (!selectedCombatant && this.props.combat.map) {
                const item = this.props.combat.map.items.find(i => i.id === this.state.selectedItemID);
                if (item) {
                    const typeOptions = ['overlay', 'token'].map(t => {
                        return { id: t, text: t };
                    });

                    const styleOptions = ['square', 'rounded', 'circle'].map(t => {
                        return { id: t, text: t };
                    });

                    selectedCombatant = (
                        <div className='card map' key='selected'>
                            <div className='heading'>
                                <div className='title'>map item</div>
                            </div>
                            <div className='card-content'>
                                <div className='subheading'>size</div>
                                <div className='section'>{item.width} sq x {item.height} sq</div>
                                <div className='section'>{item.width * 5} ft x {item.height * 5} ft</div>
                                <div className='divider' />
                                <div className='section centered'>
                                    <Radial direction='eight' click={dir => this.props.mapMove(item.id, dir)} />
                                </div>
                                <div className='divider' />
                                <div className='subheading'>type</div>
                                <Selector
                                    options={typeOptions}
                                    selectedID={item.type}
                                    select={optionID => this.props.changeValue(item, 'type', optionID)}
                                />
                                <div style={{ display: item.type === 'overlay' ? 'block' : 'none' }}>
                                    <div className='subheading'>shape</div>
                                    <Selector
                                        options={styleOptions}
                                        selectedID={item.style}
                                        select={optionID => this.props.changeValue(item, 'style', optionID)}
                                    />
                                    <div className='subheading'>color</div>
                                    <input
                                        type='color'
                                        value={item.color}
                                        onChange={event => this.props.changeValue(item, 'color', event.target.value)}
                                    />
                                    <div className='subheading'>opacity</div>
                                    <Slider
                                        min={0}
                                        max={255}
                                        value={item.opacity}
                                        tooltipVisible={false}
                                        onChange={value => this.props.changeValue(item, 'opacity', value)}
                                    />
                                    <div className='subheading'>size</div>
                                    <div className='section centered'>
                                        <Radial direction='both' click={(dir, dir2) => this.props.mapResize(item.id, dir, dir2 as 'in' | 'out')} />
                                    </div>
                                </div>
                                <div style={{ display: item.type === 'token' ? 'block' : 'none' }}>
                                    <div className='subheading'>size</div>
                                    <NumberSpin
                                        source={item}
                                        name='size'
                                        nudgeValue={delta => this.props.nudgeValue(item, 'size', delta)}
                                    />
                                </div>
                                <div className='divider' />
                                <div className='section'>
                                    <button onClick={() => this.props.mapRemove(item.id)}>remove from the map</button>
                                </div>
                            </div>
                        </div>
                    );
                }
            }
        }

        if (!selectedCombatant) {
            selectedCombatant = (
                <Note key='selected'>
                    <div className='section'>
                        select a pc or monster from the <b>initiative order</b> list to see its details here
                    </div>
                </Note>
            );
        }

        return selectedCombatant;
    }

    private createCard(combatant: Combatant) {
        let mode = 'combat';
        if (this.props.combat.map) {
            mode += ' tactical';
            const onMap = this.props.combat.map.items.find(i => i.id === combatant.id);
            mode += onMap ? ' on-map' : ' off-map';
        }

        switch (combatant.type) {
            case 'pc':
                return (
                    <PCCard
                        key='selected'
                        pc={combatant as Combatant & PC}
                        mode={mode}
                        combat={this.props.combat as Combat}
                        changeValue={(source, type, value) => this.props.changeValue(source, type, value)}
                        nudgeValue={(source, type, delta) => this.props.nudgeValue(source, type, delta)}
                        makeCurrent={c => this.props.makeCurrent(c)}
                        makeActive={c => this.props.makeActive(c)}
                        makeDefeated={c => this.defeatCombatant(c)}
                        removeCombatant={c => this.props.removeCombatant(c)}
                        addCondition={c => this.props.addCondition(c)}
                        editCondition={(c, condition) => this.props.editCondition(c, condition)}
                        removeCondition={(c, conditionID) => this.props.removeCondition(c, conditionID)}
                        nudgeConditionValue={(c, type, delta) => this.props.nudgeValue(c, type, delta)}
                        mapAdd={c => this.setAddingToMapID(this.state.addingToMapID ? null : c.id)}
                        mapMove={(c, dir) => this.props.mapMove(c.id, dir)}
                        mapRemove={c => this.props.mapRemove(c.id)}
                        toggleTag={(c, tag) => this.props.toggleTag(c, tag)}
                        toggleCondition={(c, condition) => this.props.toggleCondition(c, condition)}
                    />
                );
            case 'monster':
                return (
                    <MonsterCard
                        key='selected'
                        monster={combatant as Combatant & Monster}
                        mode={mode}
                        combat={this.props.combat as Combat}
                        changeValue={(c, type, value) => this.props.changeValue(c, type, value)}
                        nudgeValue={(c, type, delta) => this.props.nudgeValue(c, type, delta)}
                        makeCurrent={c => this.props.makeCurrent(c)}
                        makeActive={c => this.props.makeActive(c)}
                        makeDefeated={c => this.defeatCombatant(c)}
                        removeCombatant={c => this.props.removeCombatant(c)}
                        addCondition={c => this.props.addCondition(c)}
                        editCondition={(c, condition) => this.props.editCondition(c, condition)}
                        removeCondition={(c, conditionID) => this.props.removeCondition(c, conditionID)}
                        nudgeConditionValue={(c, type, delta) => this.props.nudgeValue(c, type, delta)}
                        mapAdd={c => this.setAddingToMapID(this.state.addingToMapID ? null : c.id)}
                        mapMove={(c, dir) => this.props.mapMove(c.id, dir)}
                        mapRemove={c => this.props.mapRemove(c.id)}
                        changeHP={(c, hp, temp) => this.props.changeHP(c as Combatant & Monster, hp, temp)}
                        toggleTag={(c, tag) => this.props.toggleTag(c, tag)}
                        toggleCondition={(c, condition) => this.props.toggleCondition(c, condition)}
                    />
                );
            default:
                return null;
        }
    }

    private defeatCombatant(combatant: Combatant) {
        if (this.state.selectedItemID === combatant.id) {
            this.setState({
                selectedItemID: null
            });
        }

        this.props.makeDefeated(combatant);
    }

    private gridSquareClicked(x: number, y: number) {
        if (this.state.addingToMapID) {
            const combatant = this.props.combat.combatants.find(c => c.id === this.state.addingToMapID);
            if (combatant) {
                this.props.mapAdd(combatant, x, y);
            }

            this.setAddingToMapID(null);
        }

        if (this.state.addingOverlay) {
            const overlay = Factory.createMapItem();
            overlay.type = 'overlay';
            overlay.x = x;
            overlay.y = y;
            overlay.width = 1;
            overlay.height = 1;
            overlay.color = '#005080';
            overlay.opacity = 127;
            overlay.style = 'square';

            this.props.addOverlay(overlay);
            this.setState({
                addingOverlay: false,
                addingToMapID: null,
                selectedItemID: overlay.id
            });
        }
    }

    public render() {
        try {
            let current: JSX.Element | null = null;
            let pending: JSX.Element[] = [];
            let active: JSX.Element[] = [];
            const defeated: JSX.Element[] = [];

            this.props.combat.combatants.forEach(combatant => {
                if (combatant.current) {
                    current = this.createCard(combatant);
                }
                if (combatant.pending && !combatant.active && !combatant.defeated) {
                    pending.push(
                        <PendingCombatantRow
                            key={combatant.id}
                            combatant={combatant}
                            select={c => this.setSelectedItemID(c.id)}
                            selected={combatant.id === this.state.selectedItemID}
                            nudgeValue={(c, type, delta) => this.props.nudgeValue(c, type, delta)}
                            makeActive={c => this.props.makeActive(c)}
                        />
                    );
                }
                if (!combatant.pending && combatant.active && !combatant.defeated) {
                    switch (combatant.type) {
                        case 'pc':
                            active.push(
                                <PCRow
                                    key={combatant.id}
                                    combatant={combatant as Combatant & PC}
                                    combat={this.props.combat as Combat}
                                    select={c => this.setSelectedItemID(c.id)}
                                    selected={combatant.id === this.state.selectedItemID}
                                />
                            );
                            break;
                        case 'monster':
                            active.push(
                                <MonsterRow
                                    key={combatant.id}
                                    combatant={combatant as Combatant & Monster}
                                    combat={this.props.combat as Combat}
                                    select={c => this.setSelectedItemID(c.id)}
                                    selected={combatant.id === this.state.selectedItemID}
                                />
                            );
                            break;
                    }
                }
                if (!combatant.pending && !combatant.active && combatant.defeated) {
                    switch (combatant.type) {
                        case 'pc':
                            defeated.push(
                                <PCRow
                                    key={combatant.id}
                                    combatant={combatant as Combatant & PC}
                                    combat={this.props.combat as Combat}
                                    select={c => this.setSelectedItemID(c.id)}
                                    selected={combatant.id === this.state.selectedItemID}
                                />
                            );
                            break;
                        case 'monster':
                            defeated.push(
                                <MonsterRow
                                    key={combatant.id}
                                    combatant={combatant as Combatant & Monster}
                                    combat={this.props.combat as Combat}
                                    select={c => this.setSelectedItemID(c.id)}
                                    selected={combatant.id === this.state.selectedItemID}
                                />
                            );
                            break;
                    }
                }
            });

            if (pending.length !== 0) {
                const pendingHelp = (
                    <Note key='pending-help'>
                        <div className='section'>these combatants are not yet part of the encounter</div>
                        <div className='section'>set initiative on each of them, then add them to the encounter</div>
                    </Note>
                );
                pending = [pendingHelp].concat(pending);
            }

            if (!current) {
                const activeHelp = (
                    /* tslint:disable:max-line-length */
                    <Note key='active-help'>
                        <div className='section'>these are the combatants taking part in this encounter; you can select them to see their stat blocks (on the right)</div>
                        <div className='section'>they are listed in initiative order (with the highest initiative score at the top of the list, and the lowest at the bottom)</div>
                        <div className='section'>when you're ready to begin the encounter, select the first combatant and press the <b>start turn</b> button on their stat block</div>
                    </Note>
                    /* tslint:enable:max-line-length */
                );
                active = [activeHelp].concat(active);
            }

            if (!current) {
                current = (
                    <Note>
                        <div className='section'>the current initiative holder will be displayed here</div>
                    </Note>
                );
            }

            let notificationSection = null;
            if (this.props.combat.notifications.length > 0) {
                const notifications = this.props.combat.notifications.map(n => (
                    <NotificationPanel
                        key={n.id}
                        notification={n}
                        close={(notification, removeCondition) => this.props.closeNotification(notification, removeCondition)}
                    />
                ));
                notificationSection = (
                    <div className='notifications'>
                        {notifications}
                    </div>
                );
            }

            let mapSection = null;
            if (this.props.combat.map) {
                mapSection = (
                    <div key='map'>
                        <MapPanel
                            map={this.props.combat.map}
                            mode='combat'
                            size={this.state.mapSize}
                            showOverlay={(this.state.addingToMapID !== null) || this.state.addingOverlay}
                            combatants={this.props.combat.combatants}
                            selectedItemID={this.state.selectedItemID ? this.state.selectedItemID : undefined}
                            setSelectedItemID={id => this.setSelectedItemID(id)}
                            gridSquareClicked={(x, y) => this.gridSquareClicked(x, y)}
                        />
                    </div>
                );
            }

            const special: JSX.Element[] = [];
            this.props.combat.combatants.forEach(c => {
                const monster = c as (Combatant & Monster);
                const legendary = monster && monster.traits && monster.traits.some(t => t.type === 'legendary') && !monster.current;
                const lair = monster && monster.traits && monster.traits.some(t => t.type === 'lair');
                if (legendary || lair) {
                    special.push(
                        <div className='card monster' key={monster.id}>
                            <div className='heading'><div className='title'>{monster.name}</div></div>
                            <div className='card-content'>
                                <TraitsPanel
                                    combatant={monster}
                                    mode='combat-special'
                                    changeValue={(source, type, value) => this.props.changeValue(source, type, value)}
                                />
                            </div>
                        </div>
                    );
                }
            });

            return (
                <div className='full-height'>
                    <Row className='combat-top-row'>
                        <Col span={8} style={{ padding: '0 10px' }}>
                            <button
                                className={this.props.combat.combatants.some(c => c.pending) ? 'disabled' : ''}
                                onClick={() => this.nextTurn()}
                            >
                                {this.props.combat.combatants.find(c => c.current) ? 'next turn' : 'start combat'}
                            </button>
                        </Col>
                        <Col span={4}>
                            <div className='statistic'>
                                round {this.props.combat.round}
                            </div>
                        </Col>
                        <Col span={4}>
                            <div className='statistic'>
                                {Napoleon.getCombatXP(this.props.combat)} xp
                            </div>
                        </Col>
                        <Col span={8} style={{ padding: '0 10px' }}>
                            <Checkbox label='show combat tools' checked={this.state.showTools} changeValue={() => this.toggleTools()} />
                        </Col>
                    </Row>
                    <Row className='combat-main'>
                        <Col span={8} className='scrollable'>
                            <div className='heading fixed-top'>initiative holder</div>
                            {current}
                        </Col>
                        <Col span={8} className='scrollable'>
                            {notificationSection}
                            <GridPanel
                                heading='waiting for intiative'
                                content={pending}
                                columns={1}
                                showToggle={true}
                            />
                            <GridPanel
                                heading={'don\'t forget'}
                                content={special}
                                columns={1}
                                showToggle={true}
                            />
                            <GridPanel
                                heading='encounter map'
                                content={[mapSection]}
                                columns={1}
                                showToggle={true}
                            />
                            <GridPanel
                                heading='initiative order'
                                content={active}
                                columns={1}
                                showToggle={true}
                            />
                            <GridPanel
                                heading='defeated'
                                content={defeated}
                                columns={1}
                                showToggle={true}
                            />
                        </Col>
                        <Col span={8} className='full-height'>
                            <div className={this.state.showTools ? 'double-sided flipped' : 'double-sided'}>
                                <div className='double-sided-inner'>
                                    <div className='front-face scrollable'>
                                        <div className='heading fixed-top'>selected combatant</div>
                                        {this.getSelectedCombatant()}
                                    </div>
                                    <div className='back-face scrollable'>
                                        <div className='heading fixed-top'>tools</div>
                                        {this.getTools()}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    {this.getPlayerView(this.props.combat)}
                </div>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}

interface NotificationProps {
    notification: Notification;
    close: (notification: Notification, removeCondition: boolean) => void;
}

class NotificationPanel extends React.Component<NotificationProps> {
    private success() {
        switch (this.props.notification.type) {
            case 'condition-save':
            case 'condition-end':
                const condition = this.props.notification.data as Condition;
                if (condition.duration) {
                    // Reduce save by 1
                    if ((condition.duration.type === 'saves') || (condition.duration.type === 'rounds')) {
                        condition.duration.count -= 1;
                        if (condition.duration.count === 0) {
                            // Remove the condition
                            this.close(true);
                        } else {
                            this.close();
                        }
                    }
                }
                break;
            case 'trait-recharge':
                // Mark trait as recharged
                const trait = this.props.notification.data as Trait;
                trait.uses = 0;
                this.close();
                break;
        }
    }

    private close(removeCondition = false) {
        this.props.close(this.props.notification, removeCondition);
    }

    public render() {
        try {
            const combatant = this.props.notification.combatant as (Combatant & Monster);
            const condition = this.props.notification.data as Condition;
            const trait = this.props.notification.data as Trait;

            const name = combatant.displayName || combatant.name || 'unnamed monster';
            switch (this.props.notification.type) {
                case 'condition-save':
                    const duration = condition.duration as ConditionDurationSaves;
                    let saveType = duration.saveType.toString();
                    if (saveType !== 'death') {
                        saveType = saveType.toUpperCase();
                    }
                    return (
                        <div key={this.props.notification.id} className='descriptive'>
                            <div className='text'>
                                {name} must make a {saveType} save against dc {duration.saveDC}
                            </div>
                            <Row gutter={10}>
                                <Col span={12}>
                                    <button key='success' onClick={() => this.success()}>success</button>
                                </Col>
                                <Col span={12}>
                                    <button key='close' onClick={() => this.close()}>close</button>
                                </Col>
                            </Row>
                        </div>
                    );
                case 'condition-end':
                    return (
                        <div key={this.props.notification.id} className='descriptive'>
                            <div className='text'>
                                {name} is no longer affected by condition {condition.name}
                            </div>
                            <button onClick={() => this.close()}>close</button>
                        </div>
                    );
                case 'trait-recharge':
                    return (
                        <div key={this.props.notification.id} className='descriptive'>
                            <div className='text'>
                                {name} can attempt to recharge {trait.name} ({trait.usage})
                            </div>
                            <Row gutter={10}>
                                <Col span={12}>
                                    <button key='recharge' onClick={() => this.success()}>recharge</button>
                                </Col>
                                <Col span={12}>
                                    <button key='close' onClick={() => this.close()}>close</button>
                                </Col>
                            </Row>
                        </div>
                    );
                default:
                    return null;
            }
        } catch (ex) {
            console.error(ex);
            return <div className='render-error'/>;
        }
    }
}

interface PendingCombatantRowProps {
    combatant: Combatant;
    selected: boolean;
    select: (combatant: Combatant) => void;
    nudgeValue: (combatant: Combatant, field: string, delta: number) => void;
    makeActive: (combatant: Combatant) => void;
}

class PendingCombatantRow extends React.Component<PendingCombatantRowProps> {
    private getInformationText() {
        if (this.props.selected) {
            return 'selected';
        }

        return null;
    }

    private onClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (this.props.select) {
            this.props.select(this.props.combatant);
        }
    }

    public render() {
        try {
            let style = 'combatant-row ' + this.props.combatant.type;
            if (this.props.combatant.current || this.props.selected) {
                style += ' highlight';
            }

            const c = this.props.combatant as (Combatant & PC) | (Combatant & Monster);

            return (
                <div className={style} onClick={e => this.onClick(e)}>
                    <div className='header'>
                        <PortraitPanel source={c} inline={true} />
                        <div className='name'>
                            {c.displayName || c.name || 'combatant'}
                        </div>
                        <span className='info'>{this.getInformationText()}</span>
                    </div>
                    <div className='content'>
                        <NumberSpin
                            source={this.props.combatant}
                            name='initiative'
                            label='initiative'
                            nudgeValue={delta => this.props.nudgeValue(this.props.combatant, 'initiative', delta)}
                        />
                        <button onClick={e => { e.stopPropagation(); this.props.makeActive(this.props.combatant); }}>add to encounter</button>
                    </div>
                </div>
            );
        } catch (ex) {
            console.error(ex);
            return <div className='render-error'/>;
        }
    }
}

interface PCRowProps {
    combatant: Combatant & PC;
    minimal: boolean;
    combat: Combat;
    selected: boolean;
    select: (combatant: Combatant & PC) => void;
}

class PCRow extends React.Component<PCRowProps> {
    public static defaultProps = {
        minimal: false
    };

    private getInformationText() {
        if (this.props.combatant.current) {
            return 'current turn';
        }

        if (this.props.selected) {
            return 'selected';
        }

        return null;
    }

    private onClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (!this.props.selected && this.props.select) {
            this.props.select(this.props.combatant);
        }
    }

    public render() {
        try {
            let style = 'combatant-row ' + this.props.combatant.type;
            if (this.props.selected) {
                style += ' highlight';
            }

            let desc = null;
            if (!this.props.minimal) {
                const race = this.props.combatant.race || 'unknown race';
                const cls = this.props.combatant.classes || 'unknown class';
                desc = (
                    <div className='section lowercase'>
                        {race + ' ' + cls + ', level ' + this.props.combatant.level}
                    </div>
                );
            }

            const notes = [];
            if (this.props.combat.map) {
                if (!this.props.combatant.pending && !this.props.combat.map.items.find(i => i.id === this.props.combatant.id)) {
                    notes.push(
                        <Note key='not-on-map' white={true}>not on the map</Note>
                    );
                }
                if (!this.props.combatant.showOnMap) {
                    notes.push(
                        <Note key='hidden' white={true}>hidden</Note>
                    );
                }
            }
            this.props.combatant.tags.forEach(tag => {
                notes.push(
                    <Note key={tag} white={true}>
                        <div className='condition'>
                            <div className='condition-name'>{Utils.getTagTitle(tag)}</div>
                            {Utils.getTagDescription(tag)}
                        </div>
                    </Note>
                );
            });
            if (this.props.combatant.conditions) {
                this.props.combatant.conditions.forEach(c => {
                    let name = c.name;
                    if (c.name === 'exhaustion') {
                        name += ' (' + c.level + ')';
                    }
                    if ((c.name === 'custom') && (c.text)) {
                        name = c.text;
                    }
                    if (c.duration) {
                        name += ' ' + Utils.conditionDurationText(c, this.props.combat);
                    }
                    const description = [];
                    const text = Utils.conditionText(c);
                    for (let n = 0; n !== text.length; ++n) {
                        description.push(<div key={n} className='condition-text'>{text[n]}</div>);
                    }
                    notes.push(
                        <Note key={c.id} white={true}>
                            <div className='condition'>
                                <div className='condition-name'>{name}</div>
                                {description}
                            </div>
                        </Note>
                    );
                });
            }

            let companions = null;
            if (this.props.combatant.companions.length > 0) {
                companions = (
                    <div className='section'>
                        <b>companions:</b> {this.props.combatant.companions.map(companion => companion.name).join(', ')}
                    </div>
                );
            }

            return (
                <div className={style} onClick={e => this.onClick(e)}>
                    <div className='header'>
                        <PortraitPanel source={this.props.combatant} inline={true} />
                        <div className='name'>
                            {this.props.combatant.displayName || this.props.combatant.name || 'combatant'}
                            {this.props.combatant.player ? ' / ' + this.props.combatant.player : ''}
                        </div>
                        <span className='info'>{this.getInformationText()}</span>
                    </div>
                    <div className='content'>
                        {desc}
                        {notes}
                        {companions}
                    </div>
                </div>
            );
        } catch (ex) {
            console.error(ex);
            return <div className='render-error'/>;
        }
    }
}

interface MonsterRowProps {
    combatant: Combatant & Monster;
    minimal: boolean;
    combat: Combat;
    selected: boolean;
    select: (combatant: Combatant & Monster) => void;
}

class MonsterRow extends React.Component<MonsterRowProps> {
    public static defaultProps = {
        minimal: false
    };

    private getInformationText() {
        if (this.props.combatant.current) {
            return 'current turn';
        }

        if (this.props.selected) {
            return 'selected';
        }

        return null;
    }

    private onClick(e: React.MouseEvent) {
        e.stopPropagation();
        if (!this.props.selected && this.props.select) {
            this.props.select(this.props.combatant);
        }
    }

    public render() {
        try {
            let style = 'combatant-row ' + this.props.combatant.type;
            if (this.props.selected) {
                style += ' highlight';
            }

            let hp = (this.props.combatant.hp ? this.props.combatant.hp : 0).toString();
            if (this.props.combatant.hpTemp > 0) {
                hp += '+' + this.props.combatant.hpTemp;
            }

            let gauge = null;
            if (!this.props.combatant.pending) {
                gauge = (
                    <HitPointGauge combatant={this.props.combatant} />
                );
            }

            const notes = [];
            if (this.props.combat.map) {
                if (!this.props.combatant.pending && !this.props.combat.map.items.find(i => i.id === this.props.combatant.id)) {
                    notes.push(
                        <Note key='not-on-map' white={true}>not on the map</Note>
                    );
                }
                if (!this.props.combatant.showOnMap) {
                    notes.push(
                        <Note key='hidden' white={true}>hidden</Note>
                    );
                }
            }
            this.props.combatant.tags.forEach(tag => {
                notes.push(
                    <Note key={tag} white={true}>
                        <div className='condition'>
                            <div className='condition-name'>{Utils.getTagTitle(tag)}</div>
                            {Utils.getTagDescription(tag)}
                        </div>
                    </Note>
                );
            });
            if (this.props.combatant.conditions) {
                this.props.combatant.conditions.forEach(c => {
                    let name = c.name;
                    if (c.name === 'exhaustion') {
                        name += ' (' + c.level + ')';
                    }
                    if ((c.name === 'custom') && (c.text)) {
                        name = c.text;
                    }
                    if (c.duration) {
                        name += ' ' + Utils.conditionDurationText(c, this.props.combat);
                    }
                    const description = [];
                    const text = Utils.conditionText(c);
                    for (let n = 0; n !== text.length; ++n) {
                        description.push(<div key={n} className='condition-text'>{text[n]}</div>);
                    }
                    notes.push(
                        <Note key={c.id} white={true}>
                            <div className='condition'>
                                <div className='condition-name'>{name}</div>
                                {description}
                            </div>
                        </Note>
                    );
                });
            }

            let dmInfo = null;
            if (!this.props.minimal) {
                dmInfo = (
                    <div>
                        <div className='section key-stats'>
                            <div className='key-stat'>
                                <div className='stat-label'>ac</div>
                                <div className='stat-value'>{this.props.combatant.ac}</div>
                            </div>
                            <div className='key-stat'>
                                <div className='stat-value'>{hp}</div>
                                <div className='stat-label'>hp</div>
                            </div>
                        </div>
                        {gauge}
                    </div>
                );
            }

            return (
                <div className={style} onClick={e => this.onClick(e)}>
                    <div className='header'>
                        <PortraitPanel source={this.props.combatant} inline={true} />
                        <div className='name'>
                            {this.props.combatant.displayName || this.props.combatant.name || 'combatant'}
                        </div>
                        <span className='info'>{this.getInformationText()}</span>
                    </div>
                    <div className='content'>
                        {dmInfo}
                        {notes}
                    </div>
                </div>
            );
        } catch (ex) {
            console.error(ex);
            return <div className='render-error'/>;
        }
    }
}
