import { NumberOrRange } from "../types/ShuraContainerTypes";

export function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function linearinterp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function resolveRandomRangeArray(value: NumberOrRange | undefined, defaultVal: number): number {
    if (Array.isArray(value)) {
        return randomInRange(value[0], value[1]);
    }
    return value ?? defaultVal;
}

function hexToRgb(hex: string): [number, number, number] {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    return [
        (bigint >> 16) & 255,
        (bigint >> 8) & 255,
        bigint & 255,
    ];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
    return `#${[r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')}`;
}

function lerpColorRGB(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
    return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
    ];
}

export function lerpColorHex(a: string, b: string, t: number): string {
    const rgbA = hexToRgb(a);
    const rgbB = hexToRgb(b);
    const lerped = lerpColorRGB(rgbA, rgbB, t);
    return rgbToHex(lerped);
}
