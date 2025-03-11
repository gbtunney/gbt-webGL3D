import * as THREE from 'three'
import {
    Mesh,
    MeshBasicMaterial,
    ShaderMaterial,
    ShaderMaterialParameters,
    Texture,
    TextureLoader,
    Vector2,
    Vector3,
    Vector4,
} from 'three'
import { CSSProperties, useEffect, useRef, useState } from 'react'
//import {getShaderMaterial} from "./../script/shader-webgl.js";
import {
    OrbitControls,
    OrthographicCamera,
    Sphere,
    useTexture,
} from '@react-three/drei'
import {
    Canvas,
    extend,
    ThreeToJSXElements,
    useFrame,
    useLoader,
    useThree,
} from '@react-three/fiber'
import { GUI } from 'dat.gui'
import { addGUIPropsFolder } from './../script/helpers.js'
import {
    fragment,
    vertex,
    Uniforms,
    SHADER_UNIFORMS_DEFAULT,
} from '../script/shader-webgl.js'

declare module '@react-three/fiber' {
    interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}
extend(THREE as any)

export const getShaderMaterial = (
    url: string,
    scaleFactor: number = 1,
    imageAspect: number = 1,
    segments: number = 6,
): ShaderMaterialParameters => {
    const _texture = useTexture(url)
    return {
        /*extensions: {
             derivatives: "#extension GL_OES_standard_derivatives : enable"
         }*/
        side: THREE.DoubleSide,
        uniforms: {
            resolution: {
                value: new THREE.Vector4(30, 30, 1, 1),
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
    }
}
const SHADER_API: Uniforms = SHADER_UNIFORMS_DEFAULT

const TextureComponent = ({ texturePath }: { texturePath: string }) => {
    /** LOAD TEXTURE URRL */
    /** INIT THE GUI CONTRTOLLER for the TEXTTURRE ONLY. */
    const materialRef = useRef<ShaderMaterial | null>(null)
    const _shaderProps: ShaderMaterialParameters = getShaderMaterial(
        texturePath,
        1,
        1,
        3,
    )
    const [uniformObj] = useState<ShaderMaterialParameters['uniforms']>(
        _shaderProps.uniforms === undefined ? {} : _shaderProps.uniforms,
    )

    useEffect(() => {
        const GUI_CONTROLLER = new GUI()
        if (materialRef.current !== null) {
            const imgController = GUI_CONTROLLER.addFolder('Image Material')
            imgController
                .add<Uniforms['offset']>(SHADER_API.offset, 'x', 0.0, 1.0, 0.1)
                .name('offset.x')
                .onChange(updateUvTransform)
            imgController
                .add<Uniforms['offset']>(SHADER_API.offset, 'y', 0.0, 1.0, 0.1)
                .name('offset.y')
                .onChange(updateUvTransform)

            imgController
                .add(SHADER_API, 'segments', 1, 12, 1)
                .name('segments')
                .onChange(updateUvTransform)

            imgController
                .add(SHADER_API, 'rotation', 0, 1, 0.05)
                .name('rotation')
                .onChange(updateUvTransform)

            imgController
                .add(SHADER_API, 'scaleFactor', 0, 2, 0.05)
                .name('scaleFactor')
                .onChange(updateUvTransform)

            const adjController: GUI = GUI_CONTROLLER.addFolder('adjustments')
            adjController
                .add<
                    Uniforms['adjustments']
                >(SHADER_API.adjustments, 'rotation', 0.0, 1.0, 0.1)
                .name('adjust rotation')
                .onChange(updateUvTransform)

            adjController
                .add<
                    Uniforms['adjustments']
                >(SHADER_API.adjustments, 'offset', 0.0, 1.0, 0.1)
                .name('offset adjustment')
                .onChange(updateUvTransform)
        }
        return () => {
            GUI_CONTROLLER.destroy()
        }
    }, [])

    /** UPDATE THE TEXTURE PROPS */
    const updateUvTransform = () => {
        if (materialRef.current !== null && uniformObj !== undefined) {
            uniformObj.segments.value = SHADER_API.segments
            uniformObj.uOffset.value = new Vector2(
                SHADER_API.offset.x,
                SHADER_API.offset.y,
            )
            uniformObj.uRotation.value = SHADER_API.rotation
            uniformObj.uScaleFactor.value = SHADER_API.scaleFactor
            uniformObj.uOffsetAmount.value = SHADER_API.adjustments.offset
            uniformObj.uRotationAmount.value = SHADER_API.adjustments.rotation
        }
    }
    return (
        <shaderMaterial
            vertexShader={vertex}
            uniforms={uniformObj}
            fragmentShader={fragment}
            transparent={true}
            ref={materialRef}
        />
    )
}

export type GeneratePlaneMeshProps = {
    imgURL: string
    scale?: number
    aspect_ratio?: number
    segments?: number
    motion?: number
    offset?: { width: number; height: number }
}
export const GeneratePlaneMesh = ({
    imgURL = 'eel.jpg',
    scale = 1,
    aspect_ratio = 1,
    segments = 6,
    motion = 1,
    offset = { width: 0, height: 0 },
}: GeneratePlaneMeshProps) => {
    // This reference gives us direct access to the THREE.Mesh object
    const ref = useRef<Mesh | null>(null)
    // Hold state for hovered and clicked events
    const { controls, camera, mouse, viewport, size, gl } = useThree()
    const reportProps = () => {
        return {
            size,
            viewport,
            mouse,
            controls,
            camera,
            gl,
        }
    }
    useEffect(() => {
        /** INIT THE GUI FOR MESH PROPS */
        const GUI_CONTROLLER = new GUI()

        if (ref.current !== null && ref.current.rotation) {
            const GUI_CONFIG = [
                { propName: 'x', min: 0, max: 500 },
                { propName: 'y', min: 0, max: 500 },
                { propName: 'z', min: 0, max: 500 },
            ]
            const _geom = ref.current?.geometry
            addGUIPropsFolder(
                GUI_CONTROLLER,
                'MESH',
                ref.current.rotation,
                GUI_CONFIG,
            )
        }
        return () => {
            GUI_CONTROLLER.destroy()
        }
    }, [])

    return (
        <mesh ref={ref}>
            <planeGeometry />
            <boxGeometry />
            <TextureComponent texturePath="/uv-checker.png" />
        </mesh>
    )
}

export const KalCanvas = (props: GeneratePlaneMeshProps) => {
    const customStyle: CSSProperties = {
        background: 'purple',
        border: '2px solid green',
        width: '50%',
        aspectRatio: 1,
    }
    const frustumSize = 1
    return (
        <Canvas style={customStyle}>
            <OrthographicCamera
                left={frustumSize / -2}
                right={frustumSize / 2}
                top={frustumSize / 2}
                bottom={frustumSize / -2}
                near={-1000}
                far={1000}
                position={[0, 0, 1]}
                makeDefault
            />
            <OrbitControls />
            <GeneratePlaneMesh {...props} />
        </Canvas>
    )
}
