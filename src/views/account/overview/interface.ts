export interface MenuListType {
    code: string
    label: string
    icon?: JSX.Element
    children?: MenuListType[]
}