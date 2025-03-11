import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseSkill')
export class BaseSkill extends Component {
    @property
    public damage: number = 10;

    @property
    public cooldown: number = 1000; // 冷却时间（毫秒）

    @property
    public level: number = 1;

    @property
    public range: number = 100; // 技能范围

    protected lastCastTime: number = 0;
    protected owner: Node = null;

    public initialize(owner: Node) {
        this.owner = owner;
        this.lastCastTime = Date.now();
    }

    public canCast(): boolean {
        const now = Date.now();
        return now - this.lastCastTime >= this.cooldown;
    }

    public cast() {
        if (!this.canCast()) return;
        
        this.onCast();
        this.lastCastTime = Date.now();
    }

    protected onCast() {
        // 具体技能效果由子类实现
    }

    protected onLevelUp() {
        // 技能升级效果由子类实现
    }

    public levelUp() {
        this.level++;
        this.onLevelUp();
    }
} 