import { Texture, Vector2, Vector4 } from 'three'
import { Dimensions, getResolution, Point } from './helpers.js'

export const vertex = `
varying vec2 vUv;
void main() {
vUv = uv;
gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`

export const fragment = `
precision mediump float; // Shader Precision
uniform sampler2D uTexture;
uniform vec4 resolution;
uniform float uOpacity;
varying vec2 vUv;
const float PI = 3.14159265359;
uniform float segments; // Number of segments
uniform vec2 uOffset;
uniform float uRotation;
uniform float uOffsetAmount;
uniform float uRotationAmount;
uniform float uScaleFactor;
uniform float uImageAspect; // Uniform for image aspect ratio

vec2 adjustUV(vec2 uv, vec2 offset, float rotation) {
vec2 uvOffset = uv + offset * uOffsetAmount;
float cosRot = cos(rotation * uRotationAmount);
float sinRot = sin(rotation * uRotationAmount);
mat2 rotMat = mat2(cosRot, -sinRot, sinRot, cosRot);
return rotMat * (uvOffset - vec2(0.5)) + vec2(0.5);
}

void main() {
vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
vec2 uv = newUV * 2.0 - 1.0;
float angle = atan(uv.y, uv.x);
float radius = length(uv);
float segment = PI * 2.0 / segments;
angle = mod(angle, segment);
angle = segment - abs(segment / 2.0 - angle);
uv = radius * vec2(cos(angle), sin(angle));
float scale = 1.0 / uScaleFactor;
vec2 adjustedUV = adjustUV(uv * scale + scale, uOffset, uRotation);
vec2 aspectCorrectedUV = vec2(adjustedUV.x, adjustedUV.y * uImageAspect);
vec2 tileIndex = floor(aspectCorrectedUV);
vec2 oddTile = mod(tileIndex, 2.0);
vec2 mirroredUV = mix(fract(aspectCorrectedUV), 1.0 - fract(aspectCorrectedUV), oddTile);
vec4 color = texture2D(uTexture, mirroredUV);
color.a *= uOpacity;
gl_FragColor = color;
}
`

export type NestedValue<Type = number> = { value: Type }

export type Uniforms = {
    dimensions: Dimensions
    offset: Point
    rotation: number
    scaleFactor: number
    segments: number
    texture: Texture
    image: {
        dimensions: Dimensions
    }
    adjustments: {
        rotation: number
        offset: number
    }
    opacity: number
}

type ShaderUniforms = {
    resolution: NestedValue<Vector4>
    uOffset: NestedValue<Vector2>
    uTexture: NestedValue<Texture>
    uRotation: NestedValue
    uScaleFactor: NestedValue
    segments: NestedValue
    uRotationAmount: NestedValue
    uOffsetAmount: NestedValue
    uImageAspect: NestedValue
    uOpacity: NestedValue
}
export const getOutUniforms = (uniforms: Uniforms): ShaderUniforms => {
    const {
        opacity,
        texture,
        dimensions,
        offset,
        rotation,
        scaleFactor,
        segments: uSegments,
        adjustments,
        image: { dimensions: imageDimensions },
    } = uniforms
    const resolution = { value: getResolution(dimensions) }
    const uOffset = { value: new Vector2(offset.x, offset.y) }
    const uRotation = { value: rotation }
    const uScaleFactor = { value: scaleFactor }
    const segments = { value: uSegments }
    const uTexture = { value: texture }

    const uRotationAmount = { value: adjustments.rotation }
    const uOffsetAmount = { value: adjustments.offset }
    const uImageAspect = {
        value: imageDimensions.width / imageDimensions.height,
    }
    const uOpacity = { value: opacity }

    return {
        uOpacity,
        resolution,
        uTexture,
        uOffset,
        uRotation,
        uRotationAmount,
        uScaleFactor,
        segments,
        uOffsetAmount,
        uImageAspect,
    }
}

/*
       {7
           resolution: {
               value: new THREE.Vector4(30,30,1,1),
           },
           uTexture: {
               value: _texture,
           },
           uOpacity: {
               value: 1,
           },
           uOffset: {
               value: new THREE.Vector2(0, 0),
           },
           uRotation: {
               value: 0,
           },
           uRotationAmount: {
               value: 0.2,
           },
           uOffsetAmount: {
               value: 0.2,
           },
           segments: {
               value: segments,
           },
           uScaleFactor: {
               value: scaleFactor,
           },
           uImageAspect: {
               value: imageAspect,
           },
       },*/
