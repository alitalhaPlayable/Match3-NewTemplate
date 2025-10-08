// eslint-disable-next-line import/no-cycle
import { BaseGC } from "./components";

// ! IMPORTANT ! Do not add any optional types or undefined as a value to components or any of its properties (recursive)
// ! IMPORTANT ! Arrays are only allowed for BaseType (primitive types) and not for ComponentValue, use objects with uuid keys if necesary.

interface BooleanFilter {
	type: "boolean";
	default: boolean;
}

interface NumberFilter {
	type: "number";
	default: number;
	min: number;
	max: number;
	step: number;
}

interface ColorFilter {
	type: "color";
	default: string;
}

interface BaseFilter {
	type: string;
	name: string;
	enabled: boolean;
}

export interface AdjustmentFilter extends BaseFilter {
	type: "adjustment";
	gamma: number; // 1, 0-5
	saturation: number; // 1, 0-5
	contrast: number; // 1, 0-5
	brightness: number; // 1, 0-5
	red: number; // 1, 0-5
	green: number; // 1, 0-5
	blue: number; // 1, 0-5
	alpha: number; // 1, 0-1
}

export interface AdvancedBloomFilter extends BaseFilter {
	type: "advancedBloom";
	threshold: number; // 0.5, 0.1-0.9
	bloomScale: number; // 1, 0.5-1.5
	brightness: number; // 1, 0.5-1.5
	blur: number; // 8, 0-20
	quality: number; // 4, 1-20
}

export interface KawaseBlurFilter extends BaseFilter {
	type: "kawaseBlur";
	strength: number; // 8, 0-20
	quality: number; // 4, 1-20
	pixelSizeX: number; // 1, 0-5
	pixelSizeY: number; // 1, 0-5
}

export interface OutlineFilter extends BaseFilter {
	type: "outline";
	color: string;
	thickness: number; // 4, 0-10
	alpha: number; // 1, 0-1
	knockout: boolean;
}

export interface GlowFilter extends BaseFilter {
	type: "glow";
	distance: number; // 10, 0-20
	innerStrength: number; // 0, 0-20
	outerStrength: number; // 2, 0-20
	color: string;
	quality: number; // 0.2, 0-1
	alpha: number; // 1, 0-1
	knockout: boolean;
}

export interface ColorOverlayFilter extends BaseFilter {
	type: "colorOverlay";
	color: string;
	alpha: number; // 1, 0-1
}

export type Filter2D = AdjustmentFilter | AdvancedBloomFilter | KawaseBlurFilter | OutlineFilter | GlowFilter | ColorOverlayFilter;

export interface Filters2DGC extends BaseGC {
	type: "filters2D";
	filters: {
		[key: string]: Filter2D;
	};
}

// DATA PROPS
interface BaseFilterData {
	type: string;
	name: string;
	enabled: BooleanFilter;
}

export interface AdjustmentFilterData extends BaseFilterData {
	type: "adjustment";
	gamma: NumberFilter; // 1, 0-5
	saturation: NumberFilter; // 1, 0-5
	contrast: NumberFilter; // 1, 0-5
	brightness: NumberFilter; // 1, 0-5
	red: NumberFilter; // 1, 0-5
	green: NumberFilter; // 1, 0-5
	blue: NumberFilter; // 1, 0-5
	alpha: NumberFilter; // 1, 0-1
	defaults: {
		gamma: number;
		saturation: number;
		contrast: number;
		brightness: number;
		red: number;
		green: number;
		blue: number;
		alpha: number;
	};
}

export interface AdvancedBloomFilterData extends BaseFilterData {
	type: "advancedBloom";
	threshold: NumberFilter; // 0.5, 0.1-0.9
	bloomScale: NumberFilter; // 1, 0.5-1.5
	brightness: NumberFilter; // 1, 0.5-1.5
	blur: NumberFilter; // 8, 0-20
	quality: NumberFilter; // 4, 1-20
	defaults: {
		threshold: number;
		bloomScale: number;
		brightness: number;
		blur: number;
		quality: number;
	};
}

export interface KawaseBlurFilterData extends BaseFilterData {
	type: "kawaseBlur";
	strength: NumberFilter; // 8, 0-20
	quality: NumberFilter; // 4, 1-20
	pixelSizeX: NumberFilter; // 1, 0-5
	pixelSizeY: NumberFilter; // 1, 0-5
	defaults: {
		strength: number;
		quality: number;
		pixelSizeX: number;
		pixelSizeY: number;
	};
}

export interface OutlineFilterData extends BaseFilterData {
	type: "outline";
	color: ColorFilter;
	thickness: NumberFilter; // 4, 0-10
	alpha: NumberFilter; // 1, 0-1
	knockout: BooleanFilter;
	defaults: {
		color: string;
		thickness: number;
		alpha: number;
		knockout: boolean;
	};
}

export interface GlowFilterData extends BaseFilterData {
	type: "glow";
	distance: NumberFilter; // 10, 0-20
	innerStrength: NumberFilter; // 0, 0-20
	outerStrength: NumberFilter; // 2, 0-20
	color: ColorFilter;
	quality: NumberFilter; // 0.2, 0-1
	alpha: NumberFilter; // 1, 0-1
	knockout: BooleanFilter;
	defaults: {
		distance: number;
		innerStrength: number;
		outerStrength: number;
		color: string;
		quality: number;
		alpha: number;
		knockout: boolean;
	};
}

export interface ColorOverlayFilterData extends BaseFilterData {
	type: "colorOverlay";
	color: ColorFilter;
	alpha: NumberFilter; // 1, 0-1
	defaults: {
		color: string;
		alpha: number;
	};
}

export type Filter2DData = AdjustmentFilterData | AdvancedBloomFilterData | KawaseBlurFilterData | OutlineFilterData | GlowFilterData | ColorOverlayFilterData;

interface FilterDataProps {
	adjustment: AdjustmentFilterData;
	advancedBloom: AdvancedBloomFilterData;
	colorOverlay: ColorOverlayFilterData;
	kawaseBlur: KawaseBlurFilterData;
	outline: OutlineFilterData;
	glow: GlowFilterData;
}

export const filterData: FilterDataProps = {
	adjustment: {
		type: "adjustment",
		name: "Adjustment",
		enabled: {
			default: true,
			type: "boolean",
		},
		gamma: {
			default: 1,
			type: "number",
			min: 0,
			max: 5,
			step: 0.1,
		},
		saturation: {
			default: 1,
			type: "number",
			min: 0,
			max: 5,
			step: 0.1,
		},
		contrast: {
			default: 1,
			type: "number",
			min: 0,
			max: 5,
			step: 0.1,
		},
		brightness: {
			default: 1,
			type: "number",
			min: 0,
			max: 5,
			step: 0.1,
		},
		red: {
			default: 1,
			type: "number",
			min: 0,
			max: 5,
			step: 0.1,
		},
		green: {
			default: 1,
			type: "number",
			min: 0,
			max: 5,
			step: 0.1,
		},
		blue: {
			default: 1,
			type: "number",
			min: 0,
			max: 5,
			step: 0.1,
		},
		alpha: {
			default: 1,
			type: "number",
			min: 0,
			max: 1,
			step: 0.1,
		},
		defaults: {
			gamma: 1,
			saturation: 1,
			contrast: 1,
			brightness: 1,
			red: 1,
			green: 1,
			blue: 1,
			alpha: 1,
		},
	},
	advancedBloom: {
		type: "advancedBloom",
		name: "Advanced Bloom",
		enabled: {
			default: true,
			type: "boolean",
		},
		threshold: {
			default: 0.5,
			type: "number",
			min: 0.1,
			max: 0.9,
			step: 0.01,
		},
		bloomScale: {
			default: 1,
			type: "number",
			min: 0.5,
			max: 1.5,
			step: 0.1,
		},
		brightness: {
			default: 1,
			type: "number",
			min: 0.5,
			max: 1.5,
			step: 0.1,
		},
		blur: {
			default: 8,
			type: "number",
			min: 0,
			max: 20,
			step: 0.1,
		},
		quality: {
			default: 4,
			type: "number",
			min: 1,
			max: 20,
			step: 0.1,
		},
		defaults: {
			threshold: 0.5,
			bloomScale: 1,
			brightness: 1,
			blur: 8,
			quality: 4,
		},
	},
	kawaseBlur: {
		type: "kawaseBlur",
		name: "Kawase Blur",
		enabled: {
			default: true,
			type: "boolean",
		},
		strength: {
			default: 8,
			type: "number",
			min: 0,
			max: 20,
			step: 0.1,
		},
		quality: {
			default: 4,
			type: "number",
			min: 1,
			max: 20,
			step: 0.1,
		},
		pixelSizeX: {
			default: 1,
			type: "number",
			min: 0,
			max: 5,
			step: 0.1,
		},
		pixelSizeY: {
			default: 1,
			type: "number",
			min: 0,
			max: 5,
			step: 0.1,
		},
		defaults: {
			strength: 8,
			quality: 4,
			pixelSizeX: 1,
			pixelSizeY: 1,
		},
	},
	outline: {
		type: "outline",
		name: "Outline",
		enabled: {
			default: true,
			type: "boolean",
		},
		color: {
			default: "#ffffff",
			type: "color",
		},
		thickness: {
			default: 4,
			type: "number",
			min: 0,
			max: 10,
			step: 0.1,
		},
		alpha: {
			default: 1,
			type: "number",
			min: 0,
			max: 1,
			step: 0.1,
		},
		knockout: {
			default: false,
			type: "boolean",
		},
		defaults: {
			color: "#000000",
			thickness: 4,
			alpha: 1,
			knockout: false,
		},
	},
	glow: {
		type: "glow",
		name: "Glow",
		enabled: {
			default: true,
			type: "boolean",
		},
		distance: {
			default: 10,
			type: "number",
			min: 0,
			max: 20,
			step: 0.1,
		},
		innerStrength: {
			default: 0,
			type: "number",
			min: 0,
			max: 20,
			step: 0.1,
		},
		outerStrength: {
			default: 2,
			type: "number",
			min: 0,
			max: 20,
			step: 0.1,
		},
		color: {
			default: "#ffffff",
			type: "color",
		},
		quality: {
			default: 0.2,
			type: "number",
			min: 0,
			max: 1,
			step: 0.1,
		},
		alpha: {
			default: 1,
			type: "number",
			min: 0,
			max: 1,
			step: 0.1,
		},
		knockout: {
			default: false,
			type: "boolean",
		},
		defaults: {
			distance: 10,
			innerStrength: 0,
			outerStrength: 2,
			color: "#ffffff",
			quality: 0.2,
			alpha: 1,
			knockout: false,
		},
	},
	colorOverlay: {
		type: "colorOverlay",
		name: "Color Overlay",
		enabled: {
			default: true,
			type: "boolean",
		},
		color: {
			default: "#ffffff",
			type: "color",
		},
		alpha: {
			default: 1,
			type: "number",
			min: 0,
			max: 1,
			step: 0.1,
		},
		defaults: {
			color: "#ffffff",
			alpha: 1,
		},
	},
};
