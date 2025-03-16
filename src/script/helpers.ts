import { Vector4 } from 'three'

export type Dimensions = {
    width: number
    height: number
}
export type Point = { x: number; y: number }
export const getResolution = (dimensions: Dimensions): Vector4 => {
    const { width: _width, height: _height } = dimensions
    const aA = _height / _width > 1 ? _width / _height : 1
    const aB = _height / _width > 1 ? 1 : _height / _width
    return new Vector4(_width, _height, aA, aB)
}
export const distanceBetweenPoints = (a: Point, b: Point) =>
    Math.hypot(b.x - a.x, b.y - a.y)
