import { GUI, GUIController } from 'dat.gui'
export type GuiEntry = {
    target: any
    propName: string
    min?: number
    max?: number
    step?: number
}

export const addGUIProps = (
    _gui: GUI,
    target: any,
    value: Omit<GuiEntry, 'target'>[],
    callbackFunc: (value?: any) => void = () => {},
): GUI => {
    const result: GUIController[] = value.map<GUIController>(
        (item: Omit<GuiEntry, 'target'>) => {
            return _gui
                .add(target, item.propName, item.min, item.max, item.step)
                .onChange(callbackFunc)
        },
    )
    // return result
    return _gui
}
