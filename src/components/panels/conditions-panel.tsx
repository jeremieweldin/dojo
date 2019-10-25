import React from 'react';

import { Icon } from 'antd';

import Utils from '../../utils/utils';

import { Combat, Combatant } from '../../models/combat';
import { Condition } from '../../models/condition';

import NumberSpin from '../controls/number-spin';

interface Props {
    combatant: Combatant;
    combat: Combat;
    nudgeConditionValue: (condition: Condition, field: string, delta: number) => void;
    addCondition: () => void;
    editCondition: (condition: Condition) => void;
    removeCondition: (conditionID: string) => void;
}

export default class ConditionsPanel extends React.Component<Props> {
    public render() {
        try {
            const conditions = [];
            if (this.props.combatant.conditions) {
                for (let n = 0; n !== this.props.combatant.conditions.length; ++n) {
                    const c = this.props.combatant.conditions[n];
                    conditions.push(
                        <ConditionPanel
                            key={n}
                            condition={c}
                            combat={this.props.combat}
                            nudgeConditionValue={(condition, type, delta) => this.props.nudgeConditionValue(condition, type, delta)}
                            editCondition={condition => this.props.editCondition(condition)}
                            removeCondition={conditionID => this.props.removeCondition(conditionID)}
                        />
                    );
                }
            }

            return (
                <div className='section'>
                    {conditions}
                    <button onClick={() => this.props.addCondition()}>add a condition</button>
                </div>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}

interface ConditionPanelProps {
    condition: Condition;
    combat: Combat;
    nudgeConditionValue: (condition: Condition, field: string, delta: number) => void;
    editCondition: (condition: Condition) => void;
    removeCondition: (conditionID: string) => void;
}

class ConditionPanel extends React.Component<ConditionPanelProps> {
    public render() {
        try {
            let name: string = this.props.condition.name || 'condition';
            if (this.props.condition.name === 'exhaustion') {
                name += ' (' + this.props.condition.level + ')';
            }
            if ((this.props.condition.name === 'custom') && (this.props.condition.text !== null)) {
                name = this.props.condition.text;
            }

            let duration = null;
            if (this.props.condition.duration !== null) {
                duration = (
                    <div className='section'>
                        <i>{Utils.conditionDurationText(this.props.condition, this.props.combat)}</i>
                    </div>
                );
            }

            const description = [];
            if (this.props.condition.name === 'exhaustion') {
                description.push(
                    <div key='level' className='section'>
                        <NumberSpin
                            source={this.props.condition}
                            name='level'
                            label='level'
                            nudgeValue={delta => this.props.nudgeConditionValue(this.props.condition, 'level', delta)}
                        />
                    </div>
                );
            }
            const text = Utils.conditionText(this.props.condition);
            for (let n = 0; n !== text.length; ++n) {
                description.push(<div key={n} className='section'>{text[n]}</div>);
            }

            return (
                <div className='group-panel condition-panel'>
                    <div>
                        <div className='condition-name'>{name}</div>
                        <div className='condition-buttons'>
                            <Icon type='edit' title='edit' onClick={() => this.props.editCondition(this.props.condition)} />
                            <Icon type='close' title='remove' onClick={() => this.props.removeCondition(this.props.condition.id)} />
                        </div>
                    </div>
                    {duration}
                    {description}
                </div>
            );
        } catch (e) {
            console.error(e);
            return <div className='render-error'/>;
        }
    }
}
