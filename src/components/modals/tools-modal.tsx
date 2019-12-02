import React from 'react';

import { MonsterGroup } from '../../models/monster-group';

import Selector from '../controls/selector';

import ActionsTool from '../tools/actions-tool';
import BookTool from '../tools/book-tool';
import ConditionsTool from '../tools/conditions-tool';
import DemographicsTool from '../tools/demographics-tool';
import DieRollerTool from '../tools/die-roller-tool';
import LanguageTool from '../tools/language-tool';
import NameTool from '../tools/name-tool';
import NPCTool from '../tools/npc-tool';
import PotionTool from '../tools/potion-tool';
import SkillsTool from '../tools/skills-tool';
import TreasureTool from '../tools/treasure-tool';

interface Props {
    library: MonsterGroup[];
}

interface State {
    view: string;
}

export default class ToolsModal extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            view: 'skills'
        };
    }

    private setView(view: string) {
        this.setState({
            view: view
        });
    }

    public render() {
        try {
            const options = [
                {
                    id: 'skills',
                    text: 'skills reference'
                },
                {
                    id: 'conditions',
                    text: 'conditions reference'
                },
                {
                    id: 'actions',
                    text: 'actions reference'
                },
                {
                    id: 'die',
                    text: 'die roller'
                },
                {
                    id: 'language',
                    text: 'language generator'
                },
                {
                    id: 'name',
                    text: 'name generator'
                },
                {
                    id: 'book',
                    text: 'book title generator'
                },
                {
                    id: 'potion',
                    text: 'potion generator'
                },
                {
                    id: 'treasure',
                    text: 'treasure generator'
                },
                {
                    id: 'npc',
                    text: 'npc generator'
                },
                {
                    id: 'demographics',
                    text: 'monster demographics'
                }
            ];

            let content = null;
            switch (this.state.view) {
                case 'skills':
                    content = (
                        <SkillsTool />
                    );
                    break;
                case 'conditions':
                    content = (
                        <ConditionsTool />
                    );
                    break;
                case 'actions':
                    content = (
                        <ActionsTool />
                    );
                    break;
                case 'die':
                    content = (
                        <DieRollerTool />
                    );
                    break;
                case 'language':
                    content = (
                        <LanguageTool />
                    );
                    break;
                case 'name':
                    content = (
                        <NameTool />
                    );
                    break;
                case 'book':
                    content = (
                        <BookTool />
                    );
                    break;
                case 'potion':
                    content = (
                        <PotionTool />
                    );
                    break;
                case 'treasure':
                    content = (
                        <TreasureTool />
                    );
                    break;
                case 'npc':
                    content = (
                        <NPCTool />
                    );
                    break;
                case 'demographics':
                    content = (
                        <DemographicsTool library={this.props.library} />
                    );
            }

            return (
                <div className='tools scrollable' style={{ padding: '10px' }}>
                    <Selector
                        options={options}
                        selectedID={this.state.view}
                        itemsPerRow={3}
                        select={optionID => this.setView(optionID)}
                    />
                    <div className='divider' />
                    {content}
                </div>
            );
        } catch (ex) {
            console.error(ex);
            return <div className='render-error'/>;
        }
    }
}