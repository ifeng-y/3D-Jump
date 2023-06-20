import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TimerManager')
export class TimerManager extends Component {
    start() {
        this.node.active = false;
    }

    update(deltaTime: number) {

    }
    startLimitTime(num: number) {
        // 显示节点并开始倒计时
        this.node.active = true;
        let node: Label = this.node.getComponent(Label); 
        let remaining = (num - Date.now()) / 1000; // 计算剩余时间（秒）
        node.string = Math.ceil(remaining) + ""; // 设置初始文本
        // 每隔一秒更新一次文本
        this.schedule(() => {
            remaining = (num - Date.now()) / 1000; // 重新计算剩余时间（秒）
            if (remaining > 0) {
                let string =remaining.toFixed(2);
                node.string = string; // 更新文本为剩余时间的整数部分
            } else {
                node.string = "0"; // 倒计时结束，显示 0
                this.node.active = false; // 隐藏节点
                this.unscheduleAllCallbacks(); // 取消所有定时器
            }
        }, 0.1);
    }
}


