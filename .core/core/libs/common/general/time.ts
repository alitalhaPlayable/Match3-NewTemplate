class Time {
	private countTime: boolean;
	private startTime: number | null;
	private totalTimePassed: number;
	private elapsedTime: number;
	private prevTime: number;
	private totalTime: number;
	private analyticsTime: number;
	public isStarted: boolean;

	constructor(totalGameTime: number) {
		this.countTime = false;
		this.startTime = null;
		this.totalTimePassed = 0;
		this.elapsedTime = 0;
		this.prevTime = 0;
		this.totalTime = totalGameTime;
		this.analyticsTime = 0;
		this.isStarted = false;
	}

	/**
	 * Start the timer
	 */
	public start() {
		if (this.isStarted) return;

		this.isStarted = true;
		this.countTime = true;
		this.startTime = new Date().getTime();
		this.elapsedTime = 0;
		this.prevTime = 0;
	}

	/**
	 * Stop the timer
	 */
	public stop() {
		if (!this.isStarted) return;

		this.totalTime = this.left();
		this.totalTimePassed = this.passed();
		this.countTime = false;
		this.isStarted = false;
	}

	/**
	 * Reset the timer
	 * @param {number} [newTime] - Duration of the timer
	 */
	public reset(newTime?: number) {
		this.countTime = true;
		this.startTime = new Date().getTime();
		this.totalTime = newTime !== undefined ? newTime : this.totalTime;
		this.totalTimePassed = 0;
		this.elapsedTime = 0;
		this.prevTime = 0;
		this.analyticsTime = 0;
	}

	/**
	 * Resume the timer
	 */
	public resume() {
		if (!this.countTime && this.startTime) {
			this.start();
		}
	}

	/**
	 * Check time left
	 * @returns {number} - Time left
	 */
	public left(): number {
		if (!this.countTime || !this.startTime) return this.totalTime;

		const elapsedTime = (new Date().getTime() - this.startTime) / 1000;
		return this.totalTime - elapsedTime;
	}

	/**
	 * Check passed time
	 * @returns {number} - Time passed
	 */
	public passed(): number {
		if (!this.countTime || !this.startTime) return this.totalTimePassed;

		const elapsedTime = (new Date().getTime() - this.startTime) / 1000;
		return elapsedTime + this.totalTimePassed;
	}

	/**
	 * Check time up
	 * @returns {boolean} - Is time up?
	 */
	public checkTimeUp(): boolean {
		if (!this.countTime || !this.startTime) return false;

		return this.elapsedTime >= this.totalTime;
	}

	/**
	 * Update the time
	 * @param {any} networkHelper - Network helper object
	 * @returns {boolean} - 1 second passed or not?
	 */
	public update(networkHelper?: any): boolean {
		if (!this.countTime || !this.startTime) return false;

		this.elapsedTime = (new Date().getTime() - this.startTime) / 1000;

		if (networkHelper && this.elapsedTime - this.prevTime >= 1) {
			this.prevTime = Math.floor(this.elapsedTime);
			networkHelper.secondPassed();
			this.analyticsTime++;
			return true;
		}
		return false;
	}

	/**
	 * Get analytics time
	 * @returns {number} - Analytics time
	 */
	public getAnalyticsTime(): number {
		return this.analyticsTime;
	}
}

export default Time;
