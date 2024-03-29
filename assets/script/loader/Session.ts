import { ILoader } from "./ILoader";

type LoaderCallback = (name: string, asset: object, assetspath: string) => void;

export class Session {
    public name: string;
    public path: string;
    public type: typeof cc.Asset;
    public loader: ILoader;
    public callbacks: LoaderCallback[];
    public targets: any[];
    public args: any[];
}