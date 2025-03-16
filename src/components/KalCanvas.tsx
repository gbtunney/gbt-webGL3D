import * as THREE from 'three'
import { Mesh } from 'three'
import { CSSProperties, useRef } from 'react'
import { OrbitControls, OrthographicCamera } from '@react-three/drei'
import {
    Canvas,
    extend,
    ThreeToJSXElements,
    useThree,
} from '@react-three/fiber'
import { useControls } from 'leva'
import { MyKalMat } from '../components/KalMaterial.tsx'

declare module '@react-three/fiber' {
    interface ThreeElements extends ThreeToJSXElements<typeof THREE> {}
}
extend(THREE as any)

export type GeneratePlaneMeshProps = {
    imgURL: string
    scale?: number
    aspect_ratio?: number | 'parent'
    controls: boolean
    orbit: boolean
    segments?: number
    motion?: number
    offset?: { width: number; height: number }
}

export const GeneratePlaneMesh = ({
    imgURL = 'eel.jpg',
    scale = 1,
    controls = true,
    aspect_ratio = 1,
    segments = 6,
    motion = 1,
    offset = { width: 0, height: 0 },
}: GeneratePlaneMeshProps) => {
    // This reference gives us direct access to the THREE.Mesh object
    const ref = useRef<Mesh | null>(null)
    const { camera, mouse, viewport, size, gl } = useThree()
    const { rotationMesh } = useControls({
        rotationMesh: [0, 0, 0],
    })
    const reportProps = () => {
        return {
            size,
            viewport,
            mouse,
            camera,
            gl,
        }
    }
    console.log(reportProps())
    return (
        <mesh ref={ref} rotation={rotationMesh} scale={[1, 1, 1]}>
            <planeGeometry />
            <MyKalMat
                my_controls={true}
                segments={7}
                scaleFactor={1}
                adjustOffset={0.2}
                adjustRotation={0.2}
                frame_animate={true}
                texture_url={imgURL}
            />
        </mesh>
    )
}

export const KalCanvas = (props: GeneratePlaneMeshProps) => {
    const customStyle: CSSProperties = {
        background: 'purple',
        border: '2px solid green',

        ...(props.aspect_ratio !== 'parent'
            ? { aspectRatio: props.aspect_ratio }
            : {}),
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
            <OrbitControls enabled={props.orbit} />
            <GeneratePlaneMesh {...props} />
        </Canvas>
    )
}
