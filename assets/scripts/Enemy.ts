import { Component, _decorator, Node, Vec3, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact } from "cc";
import { Player } from "./Player";
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property
    public moveSpeed: number = 100;
    
    @property
    public damage: number = 10;
    
    @property
    public hp: number = 50;
    
    public target: Node = null;

    private isDead: boolean = false;
    private moveDir: Vec3 = new Vec3();
    
    private lastDamageTime: number = 0;
    private damageInterval: number = 1000; // 伤害间隔，单位：毫秒

    private isContactingPlayer: boolean = false; // 追踪是否正在接触玩家
    private contactPlayer: Player = null; // 保存接触的玩家引用

    start() {
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
        collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    onDestroy() {
        // 注销碰撞检测
        const collider = this.getComponent(BoxCollider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 检查碰撞对象是否为玩家
        const player = otherCollider.getComponent(Player);
        if (player) {
            this.isContactingPlayer = true;
            this.contactPlayer = player;
            this.handlePlayerContact(); // 首次接触立即造成伤害
        }
    }

    private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const player = otherCollider.getComponent(Player);
        if (player) {
            this.isContactingPlayer = false;
            this.contactPlayer = null;
        }
    }

    update(deltaTime: number) {
        if (this.isDead) return;

        // 处理持续接触的伤害
        if (this.isContactingPlayer) {
            this.handlePlayerContact();
        }

        // 移动逻辑保持不变
        if (this.target) {
            const targetPos = this.target.position;
            const currentPos = this.node.position;
            
            Vec3.subtract(this.moveDir, targetPos, currentPos);
            this.moveDir.normalize();
            
            const newPos = new Vec3(
                currentPos.x + this.moveDir.x * this.moveSpeed * deltaTime,
                currentPos.y + this.moveDir.y * this.moveSpeed * deltaTime,
                currentPos.z
            );
            
            this.node.setPosition(newPos);
        }
    }

    private handlePlayerContact() {
        if (!this.contactPlayer) return;

        const currentTime = Date.now();
        // 检查是否可以造成伤害（间隔时间检查）
        if (currentTime - this.lastDamageTime >= this.damageInterval) {
            this.contactPlayer.takeDamage(this.damage);
            this.lastDamageTime = currentTime;
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
        this.node.destroy();
    }
} 