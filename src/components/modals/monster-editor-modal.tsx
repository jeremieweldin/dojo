import React from 'react';

import { Col, Collapse, Drawer, Icon, Input, Row } from 'antd';

import Factory from '../../utils/factory';
import Frankenstein from '../../utils/frankenstein';
import Napoleon from '../../utils/napoleon';
import Utils from '../../utils/utils';

import { MonsterFilter } from '../../models/encounter';
import { CATEGORY_TYPES, Monster, MonsterGroup, Trait, TRAIT_TYPES } from '../../models/monster-group';

import MonsterCard from '../cards/monster-card';
import Checkbox from '../controls/checkbox';
import Dropdown from '../controls/dropdown';
import NumberSpin from '../controls/number-spin';
import Selector from '../controls/selector';
import Tabs from '../controls/tabs';
import AbilityScorePanel from '../panels/ability-score-panel';
import FilterPanel from '../panels/filter-panel';
import Note from '../panels/note';
import PortraitPanel from '../panels/portrait-panel';
import TraitEditorPanel from '../panels/trait-editor-panel';
import ImageSelectionModal from './image-selection-modal';

interface Props {
    monster: Monster;
    library: MonsterGroup[];
    showSidebar: boolean;
}

interface State {
    monster: Monster;
    page: 'overview' | 'abilities' | 'cbt-stats' | 'actions';
    showFilter: boolean;
    helpSection: string;
    sidebar: 'similar' | 'scratchpad';
    similarFilter: {
        size: boolean,
        type: boolean,
        subtype: boolean,
        alignment: boolean,
        challenge: boolean
    };
    scratchpadFilter: MonsterFilter;
    scratchpadList: Monster[];
    showImageSelection: boolean;
}

export default class MonsterEditorModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            monster: props.monster,
            page: 'overview',
            showFilter: false,
            helpSection: 'speed',
            sidebar: 'similar',
            similarFilter: {
                size: true,
                type: true,
                subtype: false,
                alignment: false,
                challenge: true
            },
            scratchpadFilter: Factory.createMonsterFilter(),
            scratchpadList: [],
            showImageSelection: false
        };
    }

    private setPage(page: 'overview' | 'abilities' | 'cbt-stats' | 'actions') {
        const sections = this.getHelpOptionsForPage(page);
        this.setState({
            page: page,
            helpSection: sections[0]
        });
    }

    private setHelpSection(section: string) {
        this.setState({
            helpSection: section
        });
    }

    private toggleMatch(type: 'size' | 'type' | 'subtype' | 'alignment' | 'challenge') {
        // eslint-disable-next-line
        this.state.similarFilter[type] = !this.state.similarFilter[type];
        this.setState({
            similarFilter: this.state.similarFilter
        });
    }

    private toggleImageSelection() {
        this.setState({
            showImageSelection: !this.state.showImageSelection
        });
    }

    private addToScratchpadList(monster: Monster) {
        // eslint-disable-next-line
        this.state.scratchpadList.push(monster);
        // eslint-disable-next-line
        Utils.sort(this.state.scratchpadList);
        this.setState({
            scratchpadList: this.state.scratchpadList
        });
    }

    private removeFromScratchpadList(monster: Monster) {
        const index = this.state.scratchpadList.indexOf(monster);
        this.state.scratchpadList.splice(index, 1);
        this.setState({
            scratchpadList: this.state.scratchpadList
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Helper methods

    private getHelpOptionsForPage(page: 'overview' | 'abilities' | 'cbt-stats' | 'actions') {
        switch (page) {
            case 'overview':
                return ['speed', 'senses', 'languages', 'equipment'];
            case 'abilities':
                return ['str', 'dex', 'con', 'int', 'wis', 'cha', 'saves', 'skills'];
            case 'cbt-stats':
                return ['armor class', 'hit dice', 'resist', 'vulnerable', 'immune', 'conditions'];
            case 'actions':
                return ['actions'];
            default:
                return [];
        }
    }

    private getMonsters() {
        const monsters: Monster[] = [];
        this.props.library.forEach(group => {
            group.monsters.forEach(monster => {
                let match = true;

                if (this.state.monster.id === monster.id) {
                    match = false;
                }

                if (this.state.similarFilter.size && (this.state.monster.size !== monster.size)) {
                    match = false;
                }

                if (this.state.similarFilter.type && (this.state.monster.category !== monster.category)) {
                    match = false;
                }

                if (this.state.similarFilter.subtype && (this.state.monster.tag !== monster.tag)) {
                    match = false;
                }

                if (this.state.similarFilter.alignment && (this.state.monster.alignment !== monster.alignment)) {
                    match = false;
                }

                if (this.state.similarFilter.challenge && (this.state.monster.challenge !== monster.challenge)) {
                    match = false;
                }

                if (match) {
                    monsters.push(monster);
                }
            });
        });

        return monsters;
    }

    private setRandomValue(field: string, monsters: Monster[]) {
        Frankenstein.setRandomValue(this.state.monster, field, monsters);
        this.setState({
            monster: this.state.monster
        });
    }

    private spliceMonsters(monsters: Monster[]) {
        Frankenstein.spliceMonsters(this.state.monster, monsters);
        this.setState({
            monster: this.state.monster
        });
    }

    private addTrait(type: 'trait' | 'action' | 'bonus' | 'reaction' | 'legendary' | 'lair') {
        Frankenstein.addTrait(this.state.monster, type);
        this.setState({
            monster: this.state.monster
        });
    }

    private addRandomTrait(type: string, monsters: Monster[]) {
        Frankenstein.addRandomTrait(this.state.monster, type, monsters);
        this.setState({
            monster: this.state.monster
        });
    }

    private removeTrait(trait: Trait) {
        Frankenstein.removeTrait(this.state.monster, trait);
        this.setState({
            monster: this.state.monster
        });
    }

    private swapTraits(t1: Trait, t2: Trait) {
        Frankenstein.swapTraits(this.state.monster, t1, t2);
        this.setState({
            monster: this.state.monster
        });
    }

    private copyTrait(trait: Trait) {
        Frankenstein.copyTrait(this.state.monster, trait);
        this.setState({
            monster: this.state.monster
        });
    }

    private changeTrait(trait: Trait, field: string, value: any) {
        (trait as any)[field] = value;
        this.setState({
            monster: this.state.monster
        });
    }

    private nudgeValue(field: string, delta: number) {
        Frankenstein.nudgeValue(this.state.monster, field, delta);
        this.setState({
            monster: this.state.monster
        });
    }

    private changeValue(field: string, value: any) {
        Frankenstein.changeValue(this.state.monster, field, value);
        this.setState({
            monster: this.state.monster,
            showImageSelection: false
        });
    }

    private changeFilterValue(type: 'name' | 'challengeMin' | 'challengeMax' | 'category' | 'size', value: any) {
        // eslint-disable-next-line
        this.state.scratchpadFilter[type] = value as never;
        this.setState({
            scratchpadFilter: this.state.scratchpadFilter
        });
    }

    private nudgeFilterValue(type: 'challengeMin' | 'challengeMax', delta: number) {
        const value = Utils.nudgeChallenge(this.state.scratchpadFilter[type], delta);
        this.changeFilterValue(type, value);
    }

    private resetFilter() {
        this.setState({
            scratchpadFilter: Factory.createMonsterFilter()
        });
    }

    private matchMonster(monster: Monster) {
        return Napoleon.matchMonster(monster, this.state.scratchpadFilter);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // HTML render methods

    private getHelpSection(monsters: Monster[]) {
        switch (this.state.helpSection) {
            case 'speed':
                return this.getValueSection('speed', 'text', monsters);
            case 'senses':
                return this.getValueSection('senses', 'text', monsters);
            case 'languages':
                return this.getValueSection('languages', 'text', monsters);
            case 'equipment':
                return this.getValueSection('equipment', 'text', monsters);
            case 'str':
                return this.getValueSection('abilityScores.str', 'number', monsters);
            case 'dex':
                return this.getValueSection('abilityScores.dex', 'number', monsters);
            case 'con':
                return this.getValueSection('abilityScores.con', 'number', monsters);
            case 'int':
                return this.getValueSection('abilityScores.int', 'number', monsters);
            case 'wis':
                return this.getValueSection('abilityScores.wis', 'number', monsters);
            case 'cha':
                return this.getValueSection('abilityScores.cha', 'number', monsters);
            case 'saves':
                return this.getValueSection('savingThrows', 'text', monsters);
            case 'skills':
                return this.getValueSection('skills', 'text', monsters);
            case 'armor class':
                return this.getValueSection('ac', 'number', monsters);
            case 'hit dice':
                return this.getValueSection('hitDice', 'number', monsters);
            case 'resist':
                return this.getValueSection('damage.resist', 'text', monsters);
            case 'vulnerable':
                return this.getValueSection('damage.vulnerable', 'text', monsters);
            case 'immune':
                return this.getValueSection('damage.immune', 'text', monsters);
            case 'conditions':
                return this.getValueSection('conditionImmunities', 'text', monsters);
            case 'actions':
                return this.getActionsSection(monsters);
            default:
                return null;
        }
    }

    private getValueSection(field: string, dataType: 'text' | 'number', monsters: Monster[]) {
        const values: any[] = monsters
            .map(m => {
                const tokens = field.split('.');
                let source: any = m;
                let value = null;
                tokens.forEach(token => {
                    if (token === tokens[tokens.length - 1]) {
                        value = source[token];
                    } else {
                        source = source[token];
                    }
                });
                if ((dataType === 'text') && (value === '')) {
                    value = null;
                }
                return value;
            })
            .filter(v => v !== null);

        const distinct: { value: any, count: number }[] = [];
        if (dataType === 'number') {
            let min: number | null = null;
            let max: number | null = null;
            values.forEach(v => {
                if ((min === null) || (v < min)) {
                    min = v;
                }
                if ((max === null) || (v > max)) {
                    max = v;
                }
            });
            if ((min !== null) && (max !== null)) {
                for (let n = min; n <= max; ++n) {
                    distinct.push({
                        value: n,
                        count: 0
                    });
                }
            }
        }
        values.forEach(v => {
            const current = distinct.find(d => d.value === v);
            if (current) {
                current.count += 1;
            } else {
                distinct.push({
                    value: v,
                    count: 1
                });
            }
        });

        switch (dataType) {
            case 'number':
                Utils.sort(distinct, [{ field: 'value', dir: 'asc' }]);
                break;
            case 'text':
                Utils.sort(distinct, [{ field: 'count', dir: 'desc' }, { field: 'value', dir: 'asc' }]);
                break;
            default:
                // Do nothing
                break;
        }

        if (dataType === 'text') {
            const count = monsters.length - values.length;
            if (count !== 0) {
                distinct.push({
                    value: '',
                    count: monsters.length - values.length
                });
            }
        }

        const valueSections = distinct.map(d => {
            const width = 100 * d.count / monsters.length;
            return (
                <Row gutter={10} className='value-list' key={distinct.indexOf(d)}>
                    <Col span={8} className='text-container'>
                        {d.value || '(none specified)'}
                    </Col>
                    <Col span={8} className='bar-container'>
                        <div className='bar' style={{ width: width + '%' }} />
                    </Col>
                    <Col span={8}>
                        <button onClick={() => this.changeValue(field, d.value)}>use this value</button>
                    </Col>
                </Row>
            );
        });

        return (
            <div>
                {valueSections}
                <button onClick={() => this.setRandomValue(field, monsters)}>select random value</button>
            </div>
        );
    }

    private getActionsSection(monsters: Monster[]) {
        const rows = [];
        rows.push(
            <Row gutter={10} className='value-list' key='header'>
                <Col span={8} className='text-container'>
                    <b>type</b>
                </Col>
                <Col span={4} className='text-container number'>
                    <b>avg</b>
                </Col>
                <Col span={4} className='text-container number'>
                    <b>min - max</b>
                </Col>
            </Row>
        );

        TRAIT_TYPES.forEach(type => {
            let min: number | null = null;
            let max: number | null = null;
            let count = 0;
            monsters.forEach(m => {
                const n = m.traits.filter(t => t.type === type).length;
                if ((min === null) || (n < min)) {
                    min = n;
                }
                if ((max === null) || (n > max)) {
                    max = n;
                }
                count += n;
            });
            const avg = Math.round(count / monsters.length);

            rows.push(
                <Row gutter={10} className='value-list' key={type}>
                    <Col span={8} className={count === 0 ? 'text-container disabled' : 'text-container'}>
                        {Utils.traitType(type, true)}
                    </Col>
                    <Col span={4} className={count === 0 ? 'text-container number disabled' : 'text-container number'}>
                        {avg}
                    </Col>
                    <Col span={4} className={count === 0 ? 'text-container number disabled' : 'text-container number'}>
                        {min} - {max}
                    </Col>
                    <Col span={8}>
                        <button className={count === 0 ? 'disabled' : ''} onClick={() => this.addRandomTrait(type, monsters)}>add random</button>
                    </Col>
                </Row>
            );
        });

        return (
            <div>
                {rows}
            </div>
        );
    }

    private getMonsterCards(monsters: Monster[]) {
        const sorted = Utils.sort(monsters);
        const monsterCards = sorted.map(m => {
            return (
                <div className='section' key={m.id}>
                    <MonsterCard
                        monster={m}
                        mode={'template ' + this.state.page}
                        copyTrait={trait => this.copyTrait(trait)}
                    />
                </div>
            );
        }).filter(m => !!m);

        if (monsterCards.length === 0) {
            let info = '';
            switch (this.state.sidebar) {
                case 'similar':
                    info = 'there are no monsters in your library which match the above criteria.';
                    break;
                case 'scratchpad':
                    info = 'your scratchpad list is empty; you can add monsters to it to see their stats here.';
                    break;
            }

            return (
                <Note>{info}</Note>
            );
        }

        return monsterCards;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public render() {
        try {
            const pages = [
                {
                    id: 'overview',
                    text: 'overview'
                },
                {
                    id: 'abilities',
                    text: 'abilities'
                },
                {
                    id: 'cbt-stats',
                    text: 'combat'
                },
                {
                    id: 'actions',
                    text: 'actions'
                }
            ];

            let monsters: Monster[] = [];
            if (this.props.showSidebar) {
                switch (this.state.sidebar) {
                    case 'similar':
                        monsters = this.getMonsters();
                        break;
                    case 'scratchpad':
                        monsters = this.state.scratchpadList;
                        break;
                }
            }

            let content = null;
            switch (this.state.page) {
                case 'overview':
                    const catOptions = CATEGORY_TYPES.map(cat => ({ id: cat, text: cat }));

                    content = (
                        <Row gutter={10}>
                            <Col span={12}>
                                <div className='subheading'>name</div>
                                <Input
                                    value={this.state.monster.name}
                                    allowClear={true}
                                    onChange={event => this.changeValue('name', event.target.value)}
                                />
                                <div className='subheading'>size</div>
                                <NumberSpin
                                    source={this.state.monster}
                                    name='size'
                                    nudgeValue={delta => this.nudgeValue('size', delta)}
                                />
                                <div className='subheading'>type</div>
                                <Dropdown
                                    options={catOptions}
                                    selectedID={this.state.monster.category}
                                    select={optionID => this.changeValue('category', optionID)}
                                />
                                <div className='subheading'>subtype</div>
                                <Input
                                    value={this.state.monster.tag}
                                    allowClear={true}
                                    onChange={event => this.changeValue('tag', event.target.value)}
                                />
                                <div className='subheading'>alignment</div>
                                <Input
                                    value={this.state.monster.alignment}
                                    allowClear={true}
                                    onChange={event => this.changeValue('alignment', event.target.value)}
                                />
                                <div className='subheading'>challenge rating</div>
                                <NumberSpin
                                    source={this.state.monster}
                                    name='challenge'
                                    display={value => Utils.challenge(value)}
                                    nudgeValue={delta => this.nudgeValue('challenge', delta)}
                                />
                            </Col>
                            <Col span={12}>
                                <div className='subheading'>speed</div>
                                <Input
                                    value={this.state.monster.speed}
                                    allowClear={true}
                                    onChange={event => this.changeValue('speed', event.target.value)}
                                />
                                <div className='subheading'>senses</div>
                                <Input
                                    value={this.state.monster.senses}
                                    allowClear={true}
                                    onChange={event => this.changeValue('senses', event.target.value)}
                                />
                                <div className='subheading'>languages</div>
                                <Input
                                    value={this.state.monster.languages}
                                    allowClear={true}
                                    onChange={event => this.changeValue('languages', event.target.value)}
                                />
                                <div className='subheading'>equipment</div>
                                <Input
                                    value={this.state.monster.equipment}
                                    allowClear={true}
                                    onChange={event => this.changeValue('equipment', event.target.value)}
                                />
                                <div className='subheading'>portrait</div>
                                <PortraitPanel
                                    source={this.state.monster}
                                    edit={() => this.toggleImageSelection()}
                                    clear={() => this.changeValue('portrait', '')}
                                />
                            </Col>
                        </Row>
                    );
                    break;
                case 'abilities':
                    content = (
                        <Row gutter={10}>
                            <Col span={12}>
                                <div className='subheading'>ability scores</div>
                                <AbilityScorePanel
                                    edit={true}
                                    combatant={this.state.monster}
                                    nudgeValue={(source, type, delta) => this.nudgeValue(type, delta)}
                                />
                            </Col>
                            <Col span={12}>
                                <div className='subheading'>saving throws</div>
                                <Input
                                    value={this.state.monster.savingThrows}
                                    allowClear={true}
                                    onChange={event => this.changeValue('savingThrows', event.target.value)}
                                />
                                <div className='subheading'>skills</div>
                                <Input
                                    value={this.state.monster.skills}
                                    allowClear={true}
                                    onChange={event => this.changeValue('skills', event.target.value)}
                                />
                            </Col>
                        </Row>
                    );
                    break;
                case 'cbt-stats':
                    content = (
                        <Row gutter={10}>
                            <Col span={12}>
                                <div className='subheading'>armor class</div>
                                <NumberSpin
                                    source={this.state.monster}
                                    name='ac'
                                    nudgeValue={delta => this.nudgeValue('ac', delta)}
                                />
                                <div className='subheading'>hit dice</div>
                                <NumberSpin
                                    source={this.state.monster}
                                    name='hitDice'
                                    display={value => value + 'd' + Utils.hitDieType(this.state.monster.size)}
                                    nudgeValue={delta => this.nudgeValue('hitDice', delta)}
                                />
                                <div className='subheading'>hit points</div>
                                <div className='hp-value'>{this.state.monster.hpMax} hp</div>
                            </Col>
                            <Col span={12}>
                                <div className='subheading'>damage resistances</div>
                                <Input
                                    value={this.state.monster.damage.resist}
                                    allowClear={true}
                                    onChange={event => this.changeValue('damage.resist', event.target.value)}
                                />
                                <div className='subheading'>damage vulnerabilities</div>
                                <Input
                                    value={this.state.monster.damage.vulnerable}
                                    allowClear={true}
                                    onChange={event => this.changeValue('damage.vulnerable', event.target.value)}
                                />
                                <div className='subheading'>damage immunities</div>
                                <Input
                                    value={this.state.monster.damage.immune}
                                    allowClear={true}
                                    onChange={event => this.changeValue('damage.immune', event.target.value)}
                                />
                                <div className='subheading'>condition immunities</div>
                                <Input
                                    value={this.state.monster.conditionImmunities}
                                    allowClear={true}
                                    onChange={event => this.changeValue('conditionImmunities', event.target.value)}
                                />
                            </Col>
                        </Row>
                    );
                    break;
                case 'actions':
                    content = (
                        <TraitEditorPanel
                            combatant={this.state.monster}
                            addTrait={type => this.addTrait(type)}
                            removeTrait={trait => this.removeTrait(trait)}
                            swapTraits={(t1, t2) => this.swapTraits(t1, t2)}
                            changeValue={(trait, type, value) => this.changeTrait(trait, type, value)}
                        />
                    );
                    break;
                default:
                    // Do nothing
                    break;
            }

            let help = null;
            if (this.props.showSidebar && (monsters.length > 1)) {
                let selector = null;
                if (this.getHelpOptionsForPage(this.state.page).length > 1) {
                    const options = this.getHelpOptionsForPage(this.state.page).map(s => {
                        return {
                            id: s,
                            text: s
                        };
                    });
                    selector = (
                        <div>
                            <div className='subheading'>fields</div>
                            <Selector
                                options={options}
                                selectedID={this.state.helpSection}
                                select={optionID => this.setHelpSection(optionID)}
                            />
                            <div className='subheading'>values</div>
                        </div>
                    );
                }

                help = (
                    <div className='monster-help group-panel'>
                        <div className='heading'>information from sidebar monsters</div>
                        {selector}
                        {this.getHelpSection(monsters)}
                    </div>
                );
            }

            let sidebar = null;
            if (this.props.showSidebar) {
                let sidebarContent = null;
                switch (this.state.sidebar) {
                    case 'similar':
                        sidebarContent = (
                            <Collapse
                                bordered={false}
                                expandIcon={p => <Icon type='down-circle' rotate={p.isActive ? -180 : 0} />}
                                expandIconPosition={'right'}
                            >
                                <Collapse.Panel key='one' header='similarity criteria'>
                                    <Checkbox
                                        label={'size ' + this.state.monster.size}
                                        checked={this.state.similarFilter.size}
                                        changeValue={value => this.toggleMatch('size')}
                                    />
                                    <Checkbox
                                        label={'type ' + this.state.monster.category}
                                        checked={this.state.similarFilter.type}
                                        changeValue={value => this.toggleMatch('type')}
                                    />
                                    <Checkbox
                                        label={this.state.monster.tag ? 'subtype ' + this.state.monster.tag : 'subtype'}
                                        checked={this.state.similarFilter.subtype}
                                        disabled={!this.state.monster.tag}
                                        changeValue={value => this.toggleMatch('subtype')}
                                    />
                                    <Checkbox
                                        label={this.state.monster.alignment ? 'alignment ' + this.state.monster.alignment : 'alignment'}
                                        checked={this.state.similarFilter.alignment}
                                        disabled={!this.state.monster.alignment}
                                        changeValue={value => this.toggleMatch('alignment')}
                                    />
                                    <Checkbox
                                        label={'challenge rating ' + Utils.challenge(this.state.monster.challenge)}
                                        checked={this.state.similarFilter.challenge}
                                        changeValue={value => this.toggleMatch('challenge')}
                                    />
                                </Collapse.Panel>
                            </Collapse>
                        );
                        break;
                    case 'scratchpad':
                        {
                            const searchResults: Monster[] = [];
                            this.props.library.forEach(group => {
                                group.monsters.forEach(m => {
                                    if (!monsters.includes(m) && this.matchMonster(m)) {
                                        searchResults.push(m);
                                    }
                                });
                            });
                            Utils.sort(searchResults);
                            let resultsRows = searchResults.map(m =>
                                <button key={m.id} onClick={() => this.addToScratchpadList(m)}>{m.name}</button>
                            );
                            if (searchResults.length === 0) {
                                resultsRows = [(
                                    <Note key='none'>no monsters found</Note>
                                )];
                            }
                            let removeSection = null;
                            if (monsters.length > 0) {
                                const deleteRows = monsters.map(m =>
                                    <button key={m.id} onClick={() => this.removeFromScratchpadList(m)}>{m.name}</button>
                                );
                                removeSection = (
                                    <Collapse
                                        bordered={false}
                                        expandIcon={p => <Icon type='down-circle' rotate={p.isActive ? -180 : 0} />}
                                        expandIconPosition={'right'}
                                    >
                                        <Collapse.Panel key='one' header='remove monsters from the list'>
                                            {deleteRows}
                                        </Collapse.Panel>
                                    </Collapse>
                                );
                            }
                            sidebarContent = (
                                <div>
                                    <Collapse
                                        bordered={false}
                                        expandIcon={p => <Icon type='down-circle' rotate={p.isActive ? -180 : 0} />}
                                        expandIconPosition={'right'}
                                    >
                                        <Collapse.Panel key='one' header='add monsters to the list'>
                                            <FilterPanel
                                                filter={this.state.scratchpadFilter}
                                                changeValue={(type, value) => this.changeFilterValue(type, value)}
                                                nudgeValue={(type, delta) => this.nudgeFilterValue(type, delta)}
                                                resetFilter={() => this.resetFilter()}
                                            />
                                            <div className='divider' />
                                            {resultsRows}
                                        </Collapse.Panel>
                                    </Collapse>
                                    {removeSection}
                                </div>
                            );
                        }
                        break;
                }
                const sidebarOptions = [
                    {
                        id: 'similar',
                        text: 'similar'
                    },
                    {
                        id: 'scratchpad',
                        text: 'scratchpad'
                    }
                ];
                sidebar = (
                    <Col span={8} className='scrollable sidebar right'>
                        <Tabs
                            options={sidebarOptions}
                            selectedID={this.state.sidebar}
                            select={optionID => this.setState({sidebar: optionID as 'similar' | 'scratchpad'})}
                        />
                        {sidebarContent}
                        <div className='divider'/>
                        <button className={monsters.length < 2 ? 'disabled' : ''} onClick={() => this.spliceMonsters(monsters)}>
                            build random monster
                        </button>
                        <div className='divider'/>
                        {this.getMonsterCards(monsters)}
                    </Col>
                );
            } else {
                sidebar = (
                    <Col span={8} className='scrollable sidebar right' style={{ padding: '5px' }}>
                        <MonsterCard
                            monster={this.state.monster}
                            mode='view full'
                        />
                    </Col>
                );
            }

            return (
                <Row className='full-height'>
                    <Col span={16} className='scrollable'>
                        <Tabs
                            options={pages}
                            selectedID={this.state.page}
                            select={optionID => this.setPage(optionID as 'overview' | 'abilities' | 'cbt-stats' | 'actions')}
                        />
                        {content}
                        {help}
                    </Col>
                    {sidebar}
                    <Drawer visible={this.state.showImageSelection} closable={false} onClose={() => this.toggleImageSelection()}>
                        <ImageSelectionModal select={id => this.changeValue('portrait', id)} cancel={() => this.toggleImageSelection()} />
                    </Drawer>
                </Row>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}
