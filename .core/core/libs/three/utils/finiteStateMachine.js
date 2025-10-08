export default class FiniteStateMachine {
	constructor(states, initialState) {
		this.states = states;
		this.currentState = null;
		this.setState(initialState);
		this.enabled = true;
		this.printStateName = false;
	}
	get state() {
		return this.currentState;
	}

	setState(state, force) {
		if (!state) return;
		if (state === this.currentState && !force) return;

		const oldState = this.currentState;
		if (oldState && oldState.onExit) {
			oldState.onExit.call(this);
		}
		this.currentState = state;
		const newState = this.currentState;
		if (newState.onEnter) {
			newState.onEnter.call(this);
		}

		if (this.printStateName) {
			for (let key in this.states) {
				if (this.states[key] === state) {
					this.currentStateName = key;
					console.warn("State: ", key);
					break;
				}
			}
		}
	}
	update(delta) {
		if (!this.enabled || !this.currentState) return;

		const state = this.currentState;
		if (state.onUpdate) {
			state.onUpdate.call(this, delta);
		}
	}
}
