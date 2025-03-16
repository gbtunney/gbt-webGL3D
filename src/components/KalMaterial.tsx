import { useMemo, useRef } from 'react'
import { ShaderMaterial, MathUtils, Texture, Vector2 } from 'three'
import { shaderMaterial, useTexture } from '@react-three/drei'
import { getOutUniforms, fragment, vertex } from './../script/glshader.js'
import { distanceBetweenPoints, Point } from './../script/helpers.js'
import { useControls } from 'leva'
import { useFrame, useThree } from '@react-three/fiber'

type KalProps = {
    texture_url: string
    frame_animate?: boolean
    segments: number
    scaleFactor: number
    adjustOffset: number
    adjustRotation: number
    my_controls: boolean
}
export function MyKalMat(props: KalProps) {
    const materialRef = useRef<ShaderMaterial | undefined>(undefined)
    const { frame_animate } = props
    const { viewport, mouse } = useThree()

    const _texture: Texture = useTexture(props.texture_url)
    const UNIFORM_DEFAULTS = {
        texture: _texture,
        segments: props.segments,
        rotation: 0,
        opacity: 1,
        offset: {
            x: 0,
            y: 0,
        },
        scaleFactor: props.scaleFactor,
        dimensions: {
            width: viewport.width,
            height: viewport.height,
        },
        adjustments: {
            rotation: props.adjustRotation,
            offset: props.adjustOffset,
        },
        image: {
            dimensions: { width: 1024, height: 1024 },
        },
    }
    const control_defaults = { min: 0, max: 1, step: 0.01 }
    const obj = useControls({
        // animate: true,
        segments: {
            value: UNIFORM_DEFAULTS.segments,
            min: 2,
            max: 40,
            step: 1,
            onChange: (v) => {
                if (materialRef.current !== undefined) {
                    materialRef.current.uniforms.segments.value = v
                }
            },
        },
        adjustmentRotation: {
            value: UNIFORM_DEFAULTS.adjustments.rotation,
            ...control_defaults,
            onChange: (v: number) => {
                if (materialRef.current !== undefined) {
                    materialRef.current.uniforms.uRotationAmount.value = v
                }
            },
        },

        adjustmentOffset: {
            value: UNIFORM_DEFAULTS.adjustments.offset,
            ...control_defaults,
            onChange: (v: number) => {
                if (materialRef.current !== undefined) {
                    materialRef.current.uniforms.uOffsetAmount.value = v
                }
            },
        },
        scaleFactor: {
            value: UNIFORM_DEFAULTS.scaleFactor,
            ...control_defaults,
            onChange: (v: number) => {
                if (materialRef.current !== undefined) {
                    materialRef.current.uniforms.uScaleFactor.value = v
                }
            },
        },
        opacity: {
            value: UNIFORM_DEFAULTS.opacity,
            ...control_defaults,
            onChange: (v: number) => {
                if (materialRef.current !== undefined) {
                    materialRef.current.uniforms.uOpacity.value = v
                }
            },
        },
        rotation: {
            value: UNIFORM_DEFAULTS.rotation,
            ...control_defaults,
            onChange: (v) => {
                if (
                    materialRef.current !== undefined &&
                    frame_animate === false
                ) {
                    materialRef.current.uniforms.uRotation.value = v
                }
            },
        },
        offset: {
            value: UNIFORM_DEFAULTS.offset,
            ...control_defaults,
            onChange: (v: Point) => {
                if (materialRef.current !== undefined) {
                    materialRef.current.uniforms.uOffset.value = new Vector2(
                        v.x,
                        v.y,
                    )
                }
            },
        },
    })
    const uniforms = useMemo(() => getOutUniforms(UNIFORM_DEFAULTS), [])
    useFrame((state, delta, xrFrame) => {
        if (materialRef.current && frame_animate === true) {
            const adj: number = MathUtils.mapLinear(
                distanceBetweenPoints(mouse, { x: 0, y: 0 }),
                0,
                1,
                1.8,
                0.2,
            )
            const { x, y } = materialRef.current.uniforms.uOffset.value
            materialRef.current.uniforms.uRotation.value += 0.005 * adj
            materialRef.current.uniforms.uOffset.value = new Vector2(
                x + 0.005,
                y + 0.005,
            )
        }
    })

    return (
        <shaderMaterial
            ref={materialRef}
            vertexShader={vertex}
            fragmentShader={fragment}
            uniforms={uniforms}
        />
    )
}
