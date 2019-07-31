import { UserVo } from "../shareData/UserVo";
import { GameSwitchVo } from "../shareData/GameSwitchVo";
import NetAdapter from "../adpapter/NetAdapter";

/**
 * 游戏相关vo管理类
 */
export class GameVoManager {
    private static _instance: GameVoManager = null;
    public myUserVo: UserVo;
    public localUserVo: UserVo;

    private _gameSwitchVo: GameSwitchVo;
    public get gameSwitchVo(): GameSwitchVo {
        return this._gameSwitchVo;
    }

    public constructor() {
        this.myUserVo = new UserVo();
        this._gameSwitchVo = new GameSwitchVo();
    }

    public static get getInstance(): GameVoManager {
        if (GameVoManager._instance == null) {
            GameVoManager._instance = new GameVoManager();
        }
        return GameVoManager._instance;
    }

    public updateSwitchVo(res) {
        this._gameSwitchVo.updateSwitchVo(res);
    }

    public saveData() {
        let putKVData = {
            type: 1,
            custom_data: GameVoManager.getInstance.myUserVo.serialize()
        }
        NetAdapter.putKVData(putKVData);
    }
}
