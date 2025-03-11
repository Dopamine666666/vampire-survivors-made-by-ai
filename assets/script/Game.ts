import { _decorator, Component, Node, PhysicsSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    start() {
        // 启用物理系统
        PhysicsSystem2D.instance.enable = true;
    }
    // ... 其他代码 ...
} 