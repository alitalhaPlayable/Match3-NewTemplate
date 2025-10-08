type ColorStop = { pos: number; color: [number, number, number] };

export class FillGradient {
	private stops: ColorStop[] = [];

    constructor(colorStops: { pos: number; color: string }[]) {
        console.log(colorStops)
		this.stops = colorStops
			.map(({ pos, color }) => ({
				pos,
				color: FillGradient.hexToRGB(color),
			}))
			.sort((a, b) => a.pos - b.pos);
	}

	sample(t: number): string {
		const rgb = this.sampleRGB(t);
		return FillGradient.rgbToHex(rgb);
	}

	sampleRGB(t: number): [number, number, number] {
		if (t <= this.stops[0].pos) return this.stops[0].color;
		if (t >= this.stops[this.stops.length - 1].pos) return this.stops[this.stops.length - 1].color;

		for (let i = 0; i < this.stops.length - 1; i++) {
			const start = this.stops[i];
			const end = this.stops[i + 1];
			if (t >= start.pos && t <= end.pos) {
				const localT = (t - start.pos) / (end.pos - start.pos);
				return FillGradient.lerpRGB(start.color, end.color, localT);
			}
		}

		// Fallback
		return this.stops[0].color;
	}

	private static lerpRGB(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
		return [
			Math.round(a[0] + (b[0] - a[0]) * t),
			Math.round(a[1] + (b[1] - a[1]) * t),
			Math.round(a[2] + (b[2] - a[2]) * t),
		];
	}

	private static hexToRGB(hex: string): [number, number, number] {
		hex = hex.replace(/^#/, '');
		if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
		const num = parseInt(hex, 16);
		return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
	}

	private static rgbToHex([r, g, b]: [number, number, number]): string {
		return (
			'#' +
			[r, g, b]
				.map(v => {
					const hex = v.toString(16);
					return hex.length === 1 ? '0' + hex : hex;
				})
				.join('')
		);
    }
    
    static generateHueGradientStops(n: number) {
        return Array.from({ length: n }, (_, i) => {
            const pos = i / (n - 1);
            const hue = Math.round(360 * pos);
            return { pos, color: hslToHex(hue, 100, 50) };
        });
    }

    static randomFillGradient() {
        //@ts-ignore
        return new FillGradient(FillGradient.generateHueGradientStops(20));
    }
}

function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let [r, g, b] = [0, 0, 0];

    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    const toHex = (v: number) => {
        const hex = Math.round((v + m) * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

