import NetAdapter from "../adpapter/NetAdapter";

//网络启动器
export class NetLauncher {

    public constructor() {
        NetAdapter.Init();
    }
}