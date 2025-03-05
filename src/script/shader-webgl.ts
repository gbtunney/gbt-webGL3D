import * as THREE from 'three'
import type { Material, ShaderMaterial } from 'three'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
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

export const getShaderMaterial = (
    url: string,
    scaleFactor: number = 1,
    imageAspect: number = 1,
    segments: number = 6,
): ShaderMaterial => {
    const _texture = useLoader(TextureLoader, url)

    return new THREE.ShaderMaterial({
        /*extensions: {
             derivatives: "#extension GL_OES_standard_derivatives : enable"
         }*/
        side: THREE.DoubleSide,
        uniforms: {
            resolution: {
                value: new THREE.Vector4(),
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
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
    })
}
