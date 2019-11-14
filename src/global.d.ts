
interface Date {
    Format: (fmt?:string ,radix?: number)=>string
}

declare const NETWORK: string;

declare interface SvgrComponent extends React.StatelessComponent<React.SVGAttributes<SVGElement>> {}

declare module '*.svg' {
    const content: SvgrComponent
    export default content
}

interface Window {
    store: any
    makkii: any
}