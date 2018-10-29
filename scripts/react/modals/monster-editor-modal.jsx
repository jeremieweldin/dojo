class MonsterEditorModal extends React.Component {
    render() {
        try {
            var categories = ["aberration", "beast", "celestial", "construct", "dragon", "elemental", "fey", "fiend", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead"];
            var catOptions = categories.map(cat => { return { id: cat, text: cat }; });

            var sizes = ["tiny", "small", "medium", "large", "huge", "gargantuan"];
            var sizeOptions = sizes.map(size => { return { id: size, text: size }; });

            return (
                <div>
                    <input type="text" value={this.props.combatant.name} onChange={event => this.props.changeValue(this.props.combatant, "name", event.target.value)} />
                    <div className="divider"></div>
                    <div className="column three">
                        <div className="section">
                            <div className="subheading">size</div>
                            <Dropdown
                                options={sizeOptions}
                                selectedID={this.props.combatant.size}
                                select={optionID => this.props.changeTrait(this.props.combatant, "size", optionID)}
                            />
                            <div className="subheading">type</div>
                            <Dropdown
                                options={catOptions}
                                selectedID={this.props.combatant.category}
                                select={optionID => this.props.changeTrait(this.props.combatant, "category", optionID)}
                            />
                            <div className="subheading">subtype</div>
                            <input type="text" value={this.props.combatant.tag} onChange={event => this.props.changeValue(this.props.combatant, "tag", event.target.value)} />
                            <div className="subheading">alignment</div>
                            <input type="text" value={this.props.combatant.alignment} onChange={event => this.props.changeValue(this.props.combatant, "alignment", event.target.value)} />
                            <div className="divider"></div>
                            <div className="subheading">speed</div>
                            <input type="text" value={this.props.combatant.speed} onChange={event => this.props.changeValue(this.props.combatant, "speed", event.target.value)} />
                            <div className="subheading">saving throws</div>
                            <input type="text" value={this.props.combatant.savingThrows} onChange={event => this.props.changeValue(this.props.combatant, "savingThrows", event.target.value)} />
                            <div className="subheading">skills</div>
                            <input type="text" value={this.props.combatant.skills} onChange={event => this.props.changeValue(this.props.combatant, "skills", event.target.value)} />
                            <div className="subheading">senses</div>
                            <input type="text" value={this.props.combatant.senses} onChange={event => this.props.changeValue(this.props.combatant, "senses", event.target.value)} />
                            <div className="subheading">languages</div>
                            <input type="text" value={this.props.combatant.languages} onChange={event => this.props.changeValue(this.props.combatant, "languages", event.target.value)} />
                            <div className="subheading">equipment</div>
                            <input type="text" value={this.props.combatant.equipment} onChange={event => this.props.changeValue(this.props.combatant, "equipment", event.target.value)} />
                        </div>
                    </div>
                    <div className="column-divider"></div>
                    <div className="column three">
                    <div className="section">
                        <div className="subheading">ability scores</div>
                            <AbilityScorePanel
                                edit={true}
                                combatant={this.props.combatant}
                                nudgeValue={(source, type, delta) => this.props.nudgeValue(source, type, delta)}
                            />
                        </div>
                        <div className="divider"></div>
                        <Spin
                            source={this.props.combatant}
                            name="challenge"
                            label="challenge rating"
                            display={value => challenge(value)}
                            nudgeValue={delta => this.props.nudgeValue(this.props.combatant, "challenge", delta)}
                        />
                        <Spin
                            source={this.props.combatant}
                            name="ac"
                            label="armor class"
                            nudgeValue={delta => this.props.nudgeValue(this.props.combatant, "ac", delta)}
                        />
                        <Spin
                            source={this.props.combatant}
                            name="hitDice"
                            label="hit dice"
                            nudgeValue={delta => this.props.nudgeValue(this.props.combatant, "hitDice", delta)}
                        />
                        <div className="section centered">
                            <div><b>hit points</b> {this.props.combatant.hpMax} ({this.props.combatant.hitDice}d{hitDieType(this.props.combatant.size)})</div>
                        </div>
                        <div className="divider"></div>
                        <div className="section">
                            <div className="subheading">damage resistances</div>
                            <input type="text" value={this.props.combatant.damage.resist} onChange={event => this.props.changeValue(this.props.combatant, "damage.resist", event.target.value)} />
                            <div className="subheading">damage vulnerabilities</div>
                            <input type="text" value={this.props.combatant.damage.vulnerable} onChange={event => this.props.changeValue(this.props.combatant, "damage.vulnerable", event.target.value)} />
                            <div className="subheading">damage immunities</div>
                            <input type="text" value={this.props.combatant.damage.immune} onChange={event => this.props.changeValue(this.props.combatant, "damage.immune", event.target.value)} />
                            <div className="subheading">condition immunities</div>
                            <input type="text" value={this.props.combatant.conditionImmunities} onChange={event => this.props.changeValue(this.props.combatant, "conditionImmunities", event.target.value)} />
                        </div>
                    </div>
                    <div className="column-divider"></div>
                    <div className="column three">
                        <TraitsPanel
                            combatant={this.props.combatant}
                            edit={true}
                            addTrait={type => this.props.addTrait(this.props.combatant, type)}
                            removeTrait={trait => this.props.removeTrait(this.props.combatant, trait)}
                            changeTrait={(trait, type, value) => this.props.changeTrait(trait, type, value)}
                        />
                    </div>
                </div>
            );
        } catch (e) {
            console.error(e);
        }
    }
}