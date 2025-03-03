import {useRef, useEffect} from 'react'
import styles from "./kal.module.css";
import {Sketch} from "./script/Sketch";

function Kal({imgURL = 'eel.jpg'}) {
    //const [imgURL, setImgURL] = useState(props.imgURL)
    //const [sketchArr, setSketchArr] = useState<InstanceType<Sketch>>([])
    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const container = containerRef.current;

        if (container !== null) {

            const elements: Node[] = Array.from(container.querySelectorAll("[tlg-kaleidoscope-canvas]"));
            const wrapperResult = elements.map<InstanceType<typeof Sketch>>((element) => {
                const _mysketch: InstanceType<typeof Sketch> = new Sketch({dom: element});
                return _mysketch
            });
            console.log("reesult", wrapperResult)
        }
    }, []);

    return (
        <>
            <div ref={containerRef}>
                <div tlg-kaleidoscope-canvas={`true`} className={styles.kaleidoscope_canvas} tlg-kaleidoscope-mode="loop" id="three-container">
                    <img tlg-kaleidoscope-image={`true`} src={imgURL}/>
                </div>
            </div>
        </>
    )
}

export default Kal
