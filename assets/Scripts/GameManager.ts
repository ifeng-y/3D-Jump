import { _decorator, Component, Prefab, instantiate, Node, Label, CCInteger, Vec3, Button } from 'cc';
import { PlayerController } from "./PlayerController";
import { TimerManager } from './TimerManager';
const { ccclass, property } = _decorator;

// 赛道格子类型，坑（BT_NONE）或者实路（BT_STONE）
enum BlockType {
    BT_NONE,
    BT_STONE,
};

enum GameState {
    GS_INIT,
    GS_PLAYING,
    GS_END,
    GS_FAIL,
};

enum GameType {
    NORMAL,
    LIMIT_TIME,
    END_LESS,
}

@ccclass("GameManager")
export class GameManager extends Component {

    // 赛道预制
    @property({ type: Prefab })
    public cubePrfb: Prefab | null = null;
    // 赛道长度
    @property({ type: CCInteger })
    public roadLength: number = 50;
    private _road: BlockType[] = [];
    // 初始化当前格子索引
    public currentBlockIndex: number = 0;

    // 主界面根节点
    @property({ type: Node })
    public startMenu: Node | null = null;
    // 失败页面根节点
    @property({ type: Node })
    public failMenu: Node | null = null;
    // 成功页面根节点
    @property({ type: Node })
    public successMenu: Node | null = null;
    // 关联 Player 节点身上 PlayerController 组件
    @property({ type: PlayerController })
    public playerCtrl: PlayerController | null = null;
    // 关联步长文本组件
    @property({ type: Label })
    public stepsLabel: Label | null = null!;
    //正常模式button
    @property({ type: Button })
    public normal: Button | null = null;
    //限时模式button
    @property({ type: Button })
    public limited: Button | null = null;
    //无尽模式button
    @property({ type: Button })
    public endless: Button | null = null;
    // 当前选择模式
    public curGameType: GameType | null = null;

    @property({ type: CCInteger })
    private limiteTime: number = 15;
    private timestamp: number = 0;

    @property({ type: TimerManager })
    private timemanager: TimerManager = null;

    @property({ type: Label })
    private successLabel: Label | null = null;

    @property({ type: Node })
    public successFoeMode: Node | null = null;

    //模式修改选择
    onNormalButton() {
        this.changeButtonColor(this.curGameType);
        this.normal.normalColor.set(255, 0, 0, 255);
        this.curGameType = GameType.NORMAL;
    }

    onLimitedTimeButton() {
        this.changeButtonColor(this.curGameType);
        this.limited.normalColor.set(255, 0, 0, 255);
        this.curGameType = GameType.LIMIT_TIME;
    }

    onEndlessButton() {
        this.changeButtonColor(this.curGameType);
        this.endless.normalColor.set(255, 0, 0, 255);
        this.curGameType = GameType.END_LESS;
    }


    //修改相应按钮颜色
    changeButtonColor(number: Number) {
        if (number == 0) {
            this.normal.normalColor.set(0, 164, 0, 255);
            (this.normal as any)._updateState();
        } else if (number == 1) {
            this.limited.normalColor.set(0, 164, 0, 255);
            (this.limited as any)._updateState();
        } else if (number == 2) {
            this.endless.normalColor.set(0, 164, 0, 255);
            (this.endless as any)._updateState();
        }
    }

    start() {
        this.curState = GameState.GS_INIT;
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    limite() {
        let nowTime: number = Date.now();
        if (nowTime - this.timestamp > this.limiteTime * 1000) {
            //限时时间到了
            this.curState = GameState.GS_END;
            // 禁止接收用户操作人物移动指令
            this.playerCtrl.setInputActive(false);
            this.timemanager.start();
            this.successLabel.string = "本次" + this.stepsLabel.string;
        }
    }

    init() {
        // 关闭其他页面
        this.closeOtherMenu();
        // 激活主界面
        if (this.startMenu) {
            this.startMenu.active = true;
        }
        if (!this.curGameType) {
            //初始化模式：普通模式
            this.normal.normalColor.set(255, 0, 0, 255);
            this.curGameType = GameType.NORMAL;
        }
        // 生成赛道
        this.generateRoad();
        if (this.playerCtrl) {
            // 禁止接收用户操作人物移动指令
            this.playerCtrl.setInputActive(false);
            // 重置人物位置
            this.playerCtrl.node.setPosition(Vec3.ZERO);
            // 重置已经移动的步长数据
            this.playerCtrl.reset();
        }
    }

    set curState(value: GameState) {
        switch (value) {
            case GameState.GS_INIT:
                this.init();
                break;
            case GameState.GS_PLAYING:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }

                if (this.stepsLabel) {
                    this.stepsLabel.string = '得分：' + '0';   // 将步数重置为0
                }
                // 会出现的现象就是，游戏开始的瞬间人物已经开始移动
                // 因此，这里需要做延迟处理
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                //重置比赛开始的时间戳
                this.timestamp = Date.now();
                if (this.curGameType === GameType.LIMIT_TIME) {
                    this.timemanager.startLimitTime(this.timestamp + this.limiteTime * 1000);
                    // 以秒为单位的时间间隔
                    let interval = 1;
                    // 重复次数
                    let repeat = this.limiteTime - 1;
                    // 开始延时
                    let delay = 0;
                    this.schedule(function () {
                        // 这里的 this 指向 component
                        this.limite();
                    }, interval, repeat, delay);
                }
                break;
            case GameState.GS_END:
                if (this.curGameType === GameType.LIMIT_TIME) {
                    this.successFoeMode.active = true;
                } else if (this.successMenu) {
                    this.successMenu.active = true;
                }
                break;
            case GameState.GS_FAIL:
                //取消所有计时器
                this.unscheduleAllCallbacks();
                if (this.failMenu) {
                    this.failMenu.active = true;
                }
                break;
        }
    }

    generateRoad() {
        // 防止游戏重新开始时，赛道还是旧的赛道
        // 因此，需要移除旧赛道，清除旧赛道数据
        this.node.removeAllChildren();
        this._road = [];
        this.currentBlockIndex = 0;
        // 确保游戏运行时，人物一定站在实路上
        this._road.push(BlockType.BT_STONE);

        // 确定好每一格赛道类型
        for (let i = 1; i < this.roadLength - 1; i++) {
            // 如果上一格赛道是坑，那么这一格一定不能为坑
            if (this._road[i - 1] === BlockType.BT_NONE) {
                this._road.push(BlockType.BT_STONE);
            } else {
                this._road.push(Math.floor(Math.random() * 2));
            }
        }
        // 最后一格也是石头
        this._road.push(BlockType.BT_STONE);

        // 根据赛道类型生成赛道
        let linkedBlocks = 0;
        for (let j = 0; j < this._road.length; j++) {
            if (this._road[j]) {
                ++linkedBlocks;
            }
            if (this._road[j] == 0) {
                if (linkedBlocks > 0) {
                    this.spawnBlockByCount(j - 1, linkedBlocks);
                    linkedBlocks = 0;
                }
            }
            if (this._road.length == j + 1) {
                if (linkedBlocks > 0) {
                    this.spawnBlockByCount(j, linkedBlocks);
                    linkedBlocks = 0;
                }
            }
        }
    }

    spawnBlockByCount(lastPos: number, count: number) {
        let block: Node | null = this.spawnBlockByType(BlockType.BT_STONE);
        if (block) {
            this.node.addChild(block);
            block?.setScale(count, 1, 1);
            block?.setPosition(lastPos - (count - 1) * 0.5, -1.5, 0);
        }
    }
    spawnBlockByType(type: BlockType) {
        if (!this.cubePrfb) {
            return null;
        }

        let block: Node | null = null;
        switch (type) {
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
        }

        return block;
    }

    onStartButtonClicked() {
        // 点击主界面 play 按钮，开始游戏
        this.curState = GameState.GS_PLAYING;
    }

    playAgain() {
        this.curState = GameState.GS_INIT;
    }

    checkResult(moveIndex: number) {
        if (moveIndex < this.roadLength - 1 || this.curGameType != GameType.NORMAL) {
            // 跳到了坑上
            if (this._road[moveIndex] == BlockType.BT_NONE) {
                this.curState = GameState.GS_FAIL;
                // 禁止接收用户操作人物移动指令
                this.playerCtrl.setInputActive(false);
                if (this.curGameType === GameType.LIMIT_TIME) {
                    this.timemanager.unscheduleAllCallbacks();
                    this.timemanager.start();
                }
            }
        } else {
            if (this.curGameType === GameType.NORMAL) {
                // 跳过了最大长度
                this.curState = GameState.GS_END;
                // 禁止接收用户操作人物移动指令
                this.playerCtrl.setInputActive(false);
            }
        }
    }

    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            if (this.curGameType === GameType.NORMAL) {
                // 因为在最后一步可能出现步伐大的跳跃，但是此时无论跳跃是步伐大还是步伐小都不应该多增加分数
                this.stepsLabel.string = '得分：' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
            } else {
                this.stepsLabel.string = '得分：' + moveIndex;
            }
        }
        // 检查当前下落道路的类型，获取结果
        this.checkResult(moveIndex);

        // 非普通模式下
        if (this.curGameType != GameType.NORMAL) {
            this.deleteOldCube(moveIndex);
            this.refreshCube(moveIndex);
            if (this.playerCtrl._jumpStep === 2) {
                this.refreshCube(moveIndex);
            }
        }
    }

    refreshCube(moveIndex: number) {
        // 非普通模式下，当移动到当前格子索引大于25时
        if (moveIndex >= 25) {
            // 更新当前格子索引
            this.currentBlockIndex++;

            // 添加新格子
            let blockType: number; // 随机生成块类型，0 表示坑，1 表示石头
            if (this._road[this._road.length - 1] === BlockType.BT_NONE) {
                blockType = BlockType.BT_STONE;
            } else {
                blockType = Math.floor(Math.random() * 2);
            }
            this._road.push(blockType);
            const block = this.spawnBlockByType(blockType);
            if (block) {
                this.node.addChild(block);
                block.setPosition(this.roadLength + this.currentBlockIndex - 1, -1.5, 0);
            }
        }
    }

    deleteOldCube(moveIndex: number) {
        // 删除前面的格子
        if (this._road[moveIndex - 25] === BlockType.BT_STONE) {
            const firstBlock = this.node.children[0];
            if (firstBlock) {
                firstBlock.destroy();
            }
        }
    }

    closeOtherMenu() {
        if (this.failMenu) {
            this.failMenu.active = false;
        }
        if (this.successMenu) {
            this.successMenu.active = false;
        }
        if (this.successFoeMode) {
            this.successFoeMode.active = false;
        }
    }
}