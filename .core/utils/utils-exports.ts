// Type-only exports - this prevents TypeScript from scanning the implementation
// Only declare the function signatures you want to expose

import EventEmitter from "../core/libs/common/EventEmitter";
import LILGUI from "lil-gui";

export declare class Event {
	static get(): EventEmitter;
	static on(event: string, listener: (...args: any[]) => void, context?: any): Event;
	static off(event: string, listener?: (...args: any[]) => void, context?: any): Event;
	static once(event: string, listener: (...args: any[]) => void, context?: any): Event;
	static emit(event: string, ...args: any[]): Event;
	static removeAllListeners(event?: string): Event;
	static listenerCount(event: string): number;
	static eventNames(): (string | symbol)[];
}

export declare function redirectToStore(): void;
export declare function gameFinished(didWon: boolean): void;

export declare function playSound(id: string, loop?: boolean, volume?: number, rate?: number): number;
export declare function stopSound(id: number | string): void;
export declare function playBgMusic(): void;
export declare function stopBgMusic(): void;
export declare function setBgMusicVolume(volume: number): void;

export declare function addGuiHelper({ stats, lights, background }: { stats?: boolean; lights?: boolean; background?: boolean }): void;
export declare class GUIHelper {
	static gui: LILGUI;
	static init(props: { renderer3d: any; scene3d: any }): void;
	static addLightsGui(dirLight: any, ambLight: any): void;
	static initStats(): void;
	static addColor(kolor: any, name: string, onChange: (val: any) => void): any;
	static addCameraGui(camera: any): void;
	static addBackgroundThings(): void;
}
