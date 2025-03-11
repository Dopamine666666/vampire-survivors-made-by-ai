import { Component, _decorator, Vec3, input, Input, KeyCode, EventKeyboard, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact } from "cc";
import { Enemy } from "./Enemy";
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    // 基础属性
    @property
    public moveSpeed: number = 200;
    
    @property
    public hp: number = 100;
    
    // 角色状态
    private isDead: boolean = false;
    
    // 移动控制
    private moveDir: Vec3 = new Vec3();
    private inputDir: Vec3 = new Vec3();
    
    onLoad() {
        // 注册键盘事件
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        // 注册碰撞检测
        let collider = this.getComponent(BoxCollider2D);
        if (!collider) {
            collider = this.addComponent(BoxCollider2D);
        }
        // 设置碰撞检测属性
        collider.enabled = true;
        collider.sensor = true; // 设置为触发器，不产生物理效果
        
        // 注册碰撞回调
        collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onDestroy() {
        // 注销键盘事件
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);

        // 注销碰撞检测
        const collider = this.getComponent(BoxCollider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
    
    update(deltaTime: number) {
        if (this.isDead) return;
        
        // 更新移动
        this.moveDir.x = this.inputDir.x * this.moveSpeed * deltaTime;
        this.moveDir.y = this.inputDir.y * this.moveSpeed * deltaTime;
        
        // 应用移动
        const pos = this.node.position;
        this.node.setPosition(pos.x + this.moveDir.x, pos.y + this.moveDir.y, pos.z);
    }

    private onKeyDown(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_W:
                this.inputDir.y = 1;
                break;
            case KeyCode.KEY_S:
                this.inputDir.y = -1;
                break;
            case KeyCode.KEY_A:
                this.inputDir.x = -1;
                break;
            case KeyCode.KEY_D:
                this.inputDir.x = 1;
                break;
        }
    }

    private onKeyUp(event: EventKeyboard) {
        switch(event.keyCode) {
            case KeyCode.KEY_W:
                if (this.inputDir.y > 0) this.inputDir.y = 0;
                break;
            case KeyCode.KEY_S:
                if (this.inputDir.y < 0) this.inputDir.y = 0;
                break;
            case KeyCode.KEY_A:
                if (this.inputDir.x < 0) this.inputDir.x = 0;
                break;
            case KeyCode.KEY_D:
                if (this.inputDir.x > 0) this.inputDir.x = 0;
                break;
        }
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 检查碰撞对象是否为敌人
        const enemy = otherCollider.getComponent(Enemy);
        if (enemy) {
            this.takeDamage(enemy.damage);
        }
    }

    public takeDamage(damage: number) {
        if (this.isDead) return;
        
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
            this.onDeath();
        }
    }

    private onDeath() {
        // 处理死亡逻辑
        console.log("Player died");
    }
} 