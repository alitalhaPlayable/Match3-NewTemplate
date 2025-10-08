import { Graphics, toLocalGlobalMixin } from "pixi.js";
/**
 * to replace original C++ operator =
 * @param {Box2D.b2Vec2} vec
 * @returns {Box2D.b2Vec2}
 */
export const b2CloneVec2 = (vec) => new Box2D.b2Vec2(vec.x, vec.y);

const b2CloneMulVec2 = (vec, scale) => {
    new Box2D.b2Vec2(vec.x * scale, vec.y * scale);
};

/**
 * to replace original C++ operator *= (float)
 * @param {Box2D.b2Vec2} vec
 * @param {number} scale
 * @returns {Box2D.b2Vec2}
 */
export const b2MulVec2 = (vec, scale) => {
    vec.set_x(vec.x * scale);
    vec.set_y(vec.y * scale);
    return vec;
};
export const b2AddVec2 = (vec, vec2) => {
    vec.set_x(vec.x + vec2.x);
    vec.set_y(vec.y + vec2.y);
    return vec;
};

export const b2SubVec2 = (vec, vec2) => {
    vec.set_x(vec.x - vec2.x);
    vec.set_y(vec.y - vec2.y);
    return vec;
};

export const b2Clamp = (a, lo, hi) => (a < lo ? lo : a > hi ? hi : a);

export const b2DotVV = (a, b) => {
    return a.get_x() * b.get_x() + a.get_y() * b.get_y();
};

export function b2LinearStiffness(def, frequencyHertz, dampingRatio, bodyA, bodyB, isJoint = false) {
    const massA = bodyA.GetMass();
    const massB = bodyB.GetMass();
    let mass;
    if (massA > 0.0 && massB > 0.0) {
        mass = (massA * massB) / (massA + massB);
    } else if (massA > 0.0) {
        mass = massA;
    } else {
        mass = massB;
    }
    const omega = 2.0 * Math.PI * frequencyHertz;

    if (isJoint) {
        def.SetStiffness(mass * omega * omega);
        def.SetDamping(2.0 * mass * dampingRatio * omega);
    } else {
        def.set_stiffness(mass * omega * omega);
        def.set_damping(2.0 * mass * dampingRatio * omega);
    }
}

let scale = 1.0;

export const setDebugDrawZoom = (s) => {
    scale = s;
};

export const makeDebugDraw = (
    graphics,
    pixelsPerMeter,
    { b2Color, b2Draw: { e_shapeBit, e_jointBit, e_particleBit }, b2Transform, b2Vec2, JSDraw, wrapPointer },
) => {
    const settings = {fillStyle: "#ff0000", strokeStyle: "#ffff00"}
    /**
     * @param {Box2D.b2Color} color
     * @returns {string}
     */
    const getRgbStr = (color) => {
        const red = (color.get_r() * 255) | 0;
        const green = (color.get_g() * 255) | 0;
        const blue = (color.get_b() * 255) | 0;
        return `${red},${green},${blue}`;
    };

    /**
     * @param {string} rgbStr
     * @returns {void}
     */
    const setSettingsColor = (rgbStr) => {
        settings.fillStyle = `rgba(${rgbStr},0.5)`;
        settings.strokeStyle = `rgb(${rgbStr})`;
    };

    /**
     * @param {Box2D.b2Vec2[]} vertices
     * @param {boolean} fill
     * @returns {void}
     */
    const drawPolygon = (vertices, fill) => {
        let first = true;
        for (const vertex of vertices) {
            if (first) {
                graphics.moveTo(vertex.get_x() * scale * pixelsPerMeter, vertex.get_y() * scale* pixelsPerMeter)
                first = false;
            } else {
                graphics.lineTo(vertex.get_x() * scale* pixelsPerMeter, vertex.get_y() * scale* pixelsPerMeter);
            }
        }

        if (fill) {
            graphics.fill(settings.fillStyle)
        }
        graphics.stroke(settings.strokeStyle);
    };

    /**
     * @param {Box2D.b2Vec2} center
     * @param {number} radius
     * @param {Box2D.b2Vec2} axis
     * @param {boolean} fill
     * @returns {void}
     */
    const drawCircle = (center, radius, axis, fill) => {
        graphics.circle(center.get_x() * scale * pixelsPerMeter, center.get_y() * scale * pixelsPerMeter, radius*scale*pixelsPerMeter)

        if (fill) {
            graphics.fill(settings.fillStyle)
        }
        graphics.stroke(settings.strokeStyle)
    };

    /**
     * @param {Box2D.b2Vec2} vert1
     * @param {Box2D.b2Vec2} vert2
     * @returns {void}
     */
    const drawSegment = (vert1, vert2) => {
        graphics.moveTo(vert1.get_x() * scale * pixelsPerMeter, vert1.get_y() * scale * pixelsPerMeter);
        graphics.lineTo(vert2.get_x() * scale * pixelsPerMeter, vert2.get_y() * scale * pixelsPerMeter);
        graphics.stroke(settings.strokeStyle);
    };

    /**
     * @param {Box2D.b2Vec2} vertex
     * @param {number} sizeMetres
     * @returns {void}
     */
    const drawPoint = (vertex, sizeMetres) => {
        const sizePixels = sizeMetres / pixelsPerMeter;
        graphics.rect(
            vertex.get_x() * scale - sizePixels / 2,
            vertex.get_y() * scale - sizePixels / 2,
            sizePixels,
            sizePixels
        );
    };

    /**
     * @param {Box2D.b2Transform} transform
     * @param {number} sizeMetres
     * @returns {void}
     */
    const drawTransform = (transform) => {
        var trans = Box2D.wrapPointer(transform, Box2D.b2Transform);
        var pos = trans.get_p();
        var angle = trans.get_q().GetAngle();
        const x = pos.get_x()
        const y = pos.get_y()
        
        var sin = Math.sin(angle);
        var cos = Math.cos(angle);
        var newX = x * scale;
        var newY = y * scale;
        function transform(x, y) { return { x: x * cos + y * sin, y: -x * sin + y * cos }; }
        var origin = transform(newX, newY);
        var xAxis = transform(newX + 100, newY);
        var yAxis = transform(newX, newY + 100);
        graphics.lineStyle(2, 'rgb(192,0,0)', 1);
        graphics.moveTo(origin.x, origin.y);
        graphics.lineTo(xAxis.x, xAxis.y);
        graphics.lineStyle(2, 'rgb(0,192,0)', 1);
        graphics.moveTo(origin.x, origin.y);
        graphics.lineTo(yAxis.x, yAxis.y);
    };

    /** {@link Box2D.b2Vec2} is a struct of `float x, y` */
    const sizeOfB2Vec = Float32Array.BYTES_PER_ELEMENT * 2;

    /**
     * @param {number} array_p pointer to {@link Box2D.b2Vec2}
     * @param {number} numElements length of array
     * @param {number} sizeOfElement size of an instance of the array element
     * @param {typeof Box2D.b2Vec2} ctor constructor for the array element
     * @return {Box2D.b2Vec2[]}
     */
    const reifyArray = (array_p, numElements, sizeOfElement, ctor) =>
        Array(numElements)
            .fill(undefined)
            .map((_, index) => wrapPointer(array_p + index * sizeOfElement, ctor));

    const debugDraw = Object.assign(new JSDraw(), {
        /**
         * @param {number} vert1_p pointer to {@link Box2D.b2Vec2}
         * @param {number} vert2_p pointer to {@link Box2D.b2Vec2}
         * @param {number} color_p pointer to {@link Box2D.b2Color}
         * @returns {void}
         */
        DrawSegment(vert1_p, vert2_p, color_p) {
            const color = wrapPointer(color_p, b2Color);
            setSettingsColor(getRgbStr(color));
            const vert1 = wrapPointer(vert1_p, b2Vec2);
            const vert2 = wrapPointer(vert2_p, b2Vec2);
            drawSegment(vert1, vert2);
        },
        /**
         * @param {number} vertices_p pointer to Array<{@link Box2D.b2Vec2}>
         * @param {number} vertexCount
         * @param {number} color_p pointer to {@link Box2D.b2Color}
         * @returns {void}
         */
        DrawPolygon(vertices_p, vertexCount, color_p) {
            const color = wrapPointer(color_p, b2Color);
            setSettingsColor(getRgbStr(color));
            const vertices = reifyArray(vertices_p, vertexCount, sizeOfB2Vec, b2Vec2);

            drawPolygon(vertices, vertexCount, false);
        },
        /**
         * @param {number} vertices_p pointer to Array<{@link Box2D.b2Vec2}>
         * @param {number} vertexCount
         * @param {number} color_p pointer to {@link Box2D.b2Color}
         * @returns {void}
         */
        DrawSolidPolygon(vertices_p, vertexCount, color_p) {
            const color = wrapPointer(color_p, b2Color);
            setSettingsColor(getRgbStr(color));
            const vertices = reifyArray(vertices_p, vertexCount, sizeOfB2Vec, b2Vec2);
            drawPolygon(vertices, vertexCount, true);
        },
        /**
         * @param {number} center_p pointer to {@link Box2D.b2Vec2}
         * @param {number} radius
         * @param {number} color_p pointer to {@link Box2D.b2Color}
         * @returns {void}
         */
        DrawCircle(center_p, radius, color_p) {
            const color = wrapPointer(color_p, b2Color);
            setSettingsColor(getRgbStr(color));
            const center = wrapPointer(center_p, b2Vec2);
            const dummyAxis = new b2Vec2(0, 0);
            drawCircle(center, radius, dummyAxis, false);
        },
        /**
         * @param {number} center_p pointer to {@link Box2D.b2Vec2}
         * @param {number} radius
         * @param {number} axis_p pointer to {@link Box2D.b2Vec2}
         * @param {number} color_p pointer to {@link Box2D.b2Color}
         * @returns {void}
         */
        DrawSolidCircle(center_p, radius, axis_p, color_p) {
            const color = wrapPointer(color_p, b2Color);
            setSettingsColor(getRgbStr(color));
            const center = wrapPointer(center_p, b2Vec2);
            const axis = wrapPointer(axis_p, b2Vec2);
            drawCircle(center, radius, axis, true);
        },
        /**
         * @param {number} transform_p pointer to {@link Box2D.b2Transform}
         * @returns {void}
         */
        DrawTransform(transform_p) {
            const transform = wrapPointer(transform_p, b2Transform);
            console.log(transform)
            drawTransform(transform);
        },
        /**
         * @param {number} vertex_p pointer to {@link Box2D.b2Vec2}
         * @param {number} sizeMetres
         * @param {number} pointer to {@link Box2D.b2Color}
         * @returns {void}
         */
        DrawParticles: (centers_p, radius, colors_p, count) => {
            const color = wrapPointer(colors_p, b2Color);

            setSettingsColor(getRgbStr(color));
            const center = new b2Vec2();
            const centerArr = new Float32Array(Box2D.HEAPF32.buffer, centers_p, count * 2);
            const axis = new b2Vec2(0, 0);
            for (let i = 0; i < centerArr.length; i += 2) {
                center.Set(centerArr[i], centerArr[i + 1]);
                drawCircle(center, radius, axis, false);
            }
        },
        DrawPoint(vertex_p, sizeMetres, color_p) {
            const color = wrapPointer(color_p, b2Color);
            setSettingsColor(getRgbStr(color));
            const vertex = wrapPointer(vertex_p, b2Vec2);
            drawPoint(vertex, sizeMetres);
        },
    });
    debugDraw.SetFlags(e_shapeBit | e_jointBit /*| e_particleBit*/);
    return debugDraw;
};
