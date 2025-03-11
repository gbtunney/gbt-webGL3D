import { GUI, GUIController } from 'dat.gui'
export type GuiEntry = {
    target: any
    propName: string
    min?: number
    max?: number
    step?: number
}

export const addGUIPropsFolder = (
    _gui: GUI,
    folder_name: string | undefined,
    target: any,
    value: Omit<GuiEntry, 'target'>[],
    callbackFunc: (value?: any) => void = () => {},
): GUI => {
    const folder = _gui.addFolder(
        folder_name === undefined ? 'default' : folder_name,
    )

    const result: GUIController[] = value.map<GUIController>(
        (item: Omit<GuiEntry, 'target'>) => {
            return folder
                .add(target, item.propName, item.min, item.max, item.step)
                .onChange(callbackFunc)
        },
    )
    // return result
    return folder
}
