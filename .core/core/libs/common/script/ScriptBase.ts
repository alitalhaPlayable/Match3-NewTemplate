interface Variable {
	type: string;
	name: string;
	value: any;
}

export default class ScriptBase {
	public objectManager: any;

	protected _node!: any;
	private _varData?: {
		[key: string]: Variable;
	};

	inited = false;

	//custom variables
	[key: string]: any;
	props?: any;

	_initDefault(gameObject: any, data: any, objectManager: any) {
		this._node = gameObject;
		this._varData = data;
		this.objectManager = objectManager;
	}

	_initVariables() {
		if (!this._varData) return;

		// console.log("init variables", this._varData);
		for (let varKey in this._varData) {
			const varData = this._varData[varKey];
			if (this[varData.name] !== undefined || this[varData.name] !== null) {
				const uuid = varData.value;
				if (this._isUUID(uuid)) {
					const obj = this.objectManager.getObjectById(uuid);
					if (obj) {
						let target = obj;
						const script = obj.getComponent("scripts")?.getByName(varData.type);
						if (script) {
							target = script;
						}

						this[varData.name] = target;
					}
				} else {
					this[varData.name] = varData.value;
				}
			}
		}
	}
	awake(props?: any) {
		this.props = props;
	}

	init() {}

	update(delta: number) {}

	resize(w: number, h: number) {}

	onAdd() {}

	onRemove() {}

	_isUUID(str: string) {
		const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
		return uuidRegex.test(str);
	}
}
