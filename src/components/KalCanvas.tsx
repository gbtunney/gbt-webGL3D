import * as THREE from 'three'
import {
    Mesh,
    MeshBasicMaterial,
    ShaderMaterial,
    Texture,
    Vector3,
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
    useThree,
} from '@react-three/fiber'
import { GUI } from 'dat.gui'
import { addGUIProps } from '../script/helpers'

declare module '@react-three/fiber' {
    interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}
extend(THREE as any)

const ROT_GUI_API = {
    offsetX: 0,
    offsetY: 0,
    repeatX: 1,
    repeatY: 1,
    rotation: 0, /// Math.PI / 4, // positive is counterclockwise
    centerX: 0.5,
    centerY: 0.5,
}
const TextureComponent = ({ texturePath }: { texturePath: string }) => {
    const [texture, setTexture] = useState<Texture | undefined>(undefined)

    /** LOAD TEXTURE URRL */
    const textureProps = useTexture(
        {
            map: texturePath,
        },
        ({ map }) => {
            const __texture: Texture = map
            if (__texture !== undefined && texture === undefined) {
                setTexture(() => __texture)
                console.log('TEXTURE LOADED   ::: SETTING NEW !', texture)
            }
        },
    )
    /** INIT THE GUI CONTRTOLLER for the TEXTTURRE ONLY. */
    const materialRef = useRef<MeshBasicMaterial | null>(null)
    useEffect(() => {
        const GUI_CONTROLLER = new GUI()
        if (textureProps?.map !== undefined && materialRef.current !== null) {
            GUI_CONTROLLER.add(ROT_GUI_API, 'offsetX', 0.0, 1.0)
                .name('offset.x')
                .onChange(updateUvTransform)
            GUI_CONTROLLER.add(ROT_GUI_API, 'offsetY', 0.0, 1.0)
                .name('offset.y')
                .onChange(updateUvTransform)
            GUI_CONTROLLER.add(ROT_GUI_API, 'repeatX', 0.25, 2.0)
                .name('repeat.x')
                .onChange(updateUvTransform)
            GUI_CONTROLLER.add(ROT_GUI_API, 'repeatY', 0.25, 2.0)
                .name('repeat.y')
                .onChange(updateUvTransform)
            GUI_CONTROLLER.add(ROT_GUI_API, 'rotation', -2.0, 2.0)
                .name('rotation')
                .onChange(updateUvTransform)
            GUI_CONTROLLER.add(ROT_GUI_API, 'centerX', 0.0, 1.0)
                .name('center.x')
                .onChange(updateUvTransform)
            GUI_CONTROLLER.add(ROT_GUI_API, 'centerY', 0.0, 1.0)
                .name('center.y')
                .onChange(updateUvTransform)
        }
        return () => {
            GUI_CONTROLLER.destroy()
        }
    }, [])

    /** UPDATE THE TEXTURE PROPS */
    const updateUvTransform = () => {
        if (textureProps?.map !== undefined && materialRef.current !== null) {
            const textureToUpdate: Texture = textureProps.map

            /** INIT TEXTURE */
            textureToUpdate.wrapS = textureToUpdate.wrapT = THREE.RepeatWrapping
            // textureToUpdate.anisotropy = renderer.capabilities.getMaxAnisotropy();
            textureToUpdate.colorSpace = THREE.SRGBColorSpace

            if (textureToUpdate.matrixAutoUpdate === true) {
                textureToUpdate.offset.set(
                    ROT_GUI_API.offsetX,
                    ROT_GUI_API.offsetY,
                )
                textureToUpdate.repeat.set(
                    ROT_GUI_API.repeatX,
                    ROT_GUI_API.repeatX,
                )
                textureToUpdate.center.set(
                    ROT_GUI_API.centerX,
                    ROT_GUI_API.centerY,
                )
                textureToUpdate.rotation = ROT_GUI_API.rotation // rotation is around center
            } else {
                // setting the matrix uv transform directly
                //texture.matrix.setUvTransform( API.offsetX, API.offsetY, API.repeatX, API.repeatY, API.rotation, API.centerX, API.centerY );
                // another way...
                textureToUpdate.matrix
                    .identity()
                    .translate(-ROT_GUI_API.centerX, -ROT_GUI_API.centerY)
                    .rotate(ROT_GUI_API.rotation) // I don't understand how rotation can precede scale, but it seems to be required...
                    .scale(ROT_GUI_API.repeatX, ROT_GUI_API.repeatY)
                    .translate(ROT_GUI_API.centerX, ROT_GUI_API.centerY)
                    .translate(ROT_GUI_API.offsetX, ROT_GUI_API.offsetY)
            }
        }
    }
    return <meshBasicMaterial ref={materialRef} {...textureProps} />
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
    const vec = new Vector3()
    //BUILD
    // const plane_geometry =  new THREE.PlaneGeometry(1, 1, 1, 1);
    //   const  custom_material:ShaderMaterial =  getShaderMaterial(imgURL,scale,segments,aspect_ratio)
    //console.log("MATERIAL!",custom_material
    // Subscribe this component to the render-loop, rotate the mesh every frame
    /* useFrame((state, delta) => {
        // ref.current.rotation.x += delta
        // ref.current.offset.x +=deltas
        /!*  console.log(
              "mousing", mouse, viewport
          )*!/
    })*/
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
        const GUI_CONTROLLER = new GUI({ name: 'MESH' })
        if (ref.current !== null && ref.current.rotation) {
            const GUI_CONFIG = [
                { propName: 'x', min: 0, max: 500 },
                { propName: 'y', min: 0, max: 500 },
                { propName: 'z', min: 0, max: 500 },
            ]
            const _geom = ref.current?.geometry
            addGUIProps(GUI_CONTROLLER, ref.current.rotation, GUI_CONFIG)
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
