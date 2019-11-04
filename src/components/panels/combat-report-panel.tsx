import React from 'react';

import Utils from '../../utils/utils';

import { Combat } from '../../models/combat';

import ChartPanel from './chart-panel';

interface Props {
    combat: Combat;
}

export default class CombatReportPanel extends React.Component<Props> {
    private getKillsChart() {
        let data: {text: string, value: number}[] = [];

        this.props.combat.report
            .filter(entry => entry.type === 'kill')
            .forEach(entry => {
                const combatant = this.props.combat.combatants.find(c => c.id === entry.combatantID);
                if (combatant && (combatant.type === 'pc')) {
                    let datum = data.find(d => d.text === combatant.displayName);
                    if (datum === undefined) {
                        datum = {
                            text: combatant.displayName,
                            value: 0
                        };
                        data.push(datum);
                    }
                    datum.value += 1;
                }
            });

        if (data.length === 0) {
            return null;
        }

        data = Utils.sort(data, [{field: 'value', dir: 'desc'}]);

        return (
            <div>
                <div className='subheading'>kills</div>
                <ChartPanel data={data} />
            </div>
        );
    }

    private getDamageChart() {
        let data: {text: string, value: number}[] = [];

        this.props.combat.report
            .filter(entry => entry.type === 'damage')
            .forEach(entry => {
                const combatant = this.props.combat.combatants.find(c => c.id === entry.combatantID);
                if (combatant && (combatant.type === 'pc')) {
                    let datum = data.find(d => d.text === combatant.displayName);
                    if (datum === undefined) {
                        datum = {
                            text: combatant.displayName,
                            value: 0
                        };
                        data.push(datum);
                    }
                    datum.value += entry.value;
                }
            });

        if (data.length === 0) {
            return null;
        }

        data = Utils.sort(data, [{field: 'value', dir: 'desc'}]);

        return (
            <div>
                <div className='subheading'>damage dealt</div>
                <ChartPanel data={data} />
            </div>
        );
    }

    private getMobilityChart() {
        let data: {text: string, value: number}[] = [];

        this.props.combat.report
            .filter(entry => entry.type === 'movement')
            .forEach(entry => {
                const combatant = this.props.combat.combatants.find(c => c.id === entry.combatantID);
                if (combatant && (combatant.type === 'pc')) {
                    let datum = data.find(d => d.text === combatant.displayName);
                    if (datum === undefined) {
                        datum = {
                            text: combatant.displayName,
                            value: 0
                        };
                        data.push(datum);
                    }
                    datum.value += entry.value;
                }
            });

        if (data.length === 0) {
            return null;
        }

        data = Utils.sort(data, [{field: 'value', dir: 'desc'}]);

        return (
            <div>
                <div className='subheading'>mobility</div>
                <ChartPanel data={data} />
            </div>
        );
    }

    private getConditionsAddedChart() {
        let data: {text: string, value: number}[] = [];

        this.props.combat.report
            .filter(entry => entry.type === 'condition-add')
            .forEach(entry => {
                const combatant = this.props.combat.combatants.find(c => c.id === entry.combatantID);
                if (combatant && (combatant.type === 'pc')) {
                    let datum = data.find(d => d.text === combatant.displayName);
                    if (datum === undefined) {
                        datum = {
                            text: combatant.displayName,
                            value: 0
                        };
                        data.push(datum);
                    }
                    datum.value += entry.value;
                }
            });

        if (data.length === 0) {
            return null;
        }

        data = Utils.sort(data, [{field: 'value', dir: 'desc'}]);

        return (
            <div>
                <div className='subheading'>conditions added</div>
                <ChartPanel data={data} />
            </div>
        );
    }

    private getConditionsRemovedChart() {
        let data: {text: string, value: number}[] = [];

        this.props.combat.report
            .filter(entry => entry.type === 'condition-remove')
            .forEach(entry => {
                const combatant = this.props.combat.combatants.find(c => c.id === entry.combatantID);
                if (combatant && (combatant.type === 'pc')) {
                    let datum = data.find(d => d.text === combatant.displayName);
                    if (datum === undefined) {
                        datum = {
                            text: combatant.displayName,
                            value: 0
                        };
                        data.push(datum);
                    }
                    datum.value += entry.value;
                }
            });

        if (data.length === 0) {
            return null;
        }

        data = Utils.sort(data, [{field: 'value', dir: 'desc'}]);

        return (
            <div>
                <div className='subheading'>conditions removed</div>
                <ChartPanel data={data} />
            </div>
        );
    }

    private getTurnLengthChart() {
        let data: {text: string, value: number}[] = [];

        let start: number | null = null;

        this.props.combat.report
            .filter(entry => (entry.type === 'turn-start') || (entry.type === 'turn-end'))
            .forEach(entry => {
                switch (entry.type) {
                    case 'turn-start':
                        start = entry.timestamp;
                        break;
                    case 'turn-end':
                        if (start !== null) {
                            const combatant = this.props.combat.combatants.find(c => c.id === entry.combatantID);
                            if (combatant && (combatant.type === 'pc')) {
                                let datum = data.find(d => d.text === combatant.displayName);
                                if (datum === undefined) {
                                    datum = {
                                        text: combatant.displayName,
                                        value: 0
                                    };
                                    data.push(datum);
                                }
                                const length = entry.timestamp - start;
                                datum.value += length;
                            }
                            start = null;
                        }
                        break;
                }
            });

        if (data.length === 0) {
            return null;
        }

        data = Utils.sort(data, [{field: 'value', dir: 'asc'}]);

        return (
            <div>
                <div className='subheading'>turn length</div>
                <ChartPanel
                    data={data}
                    display={value => {
                        const d = new Date(value);
                        return d.getMinutes() + 'm ' + d.getSeconds() + 's';
                    }}
                />
            </div>
        );
    }

    public render() {
        try {
            return (
                <div className='group-panel combat-report'>
                    {this.getKillsChart()}
                    {this.getDamageChart()}
                    {this.getMobilityChart()}
                    {this.getConditionsAddedChart()}
                    {this.getConditionsRemovedChart()}
                    {this.getTurnLengthChart()}
                </div>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}
