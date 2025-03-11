import { Component, _decorator, Node, Vec3, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact, RigidBody2D, ERigidBody2DType, Vec2 } from "cc";
import { Player } from "./Player";
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property
    public moveSpeed: number = 5;
    
    @property
    public damage: number = 10;
    
    @property
    public hp: number = 50;
    
    public target: Node = null;

    public isDead: boolean = false;
    private moveDir: Vec3 = new Vec3();
    private rigidBody: RigidBody2D = null;
    
    private lastDamageTime: number = 0;
    private damageInterval: number = 1000; // 伤害间隔，单位：毫秒

    private isContactingPlayer: boolean = false; // 追踪是否正在接触玩家
    private contactPlayer: Player = null; // 保存接触的玩家引用

    start() {
        // 添加刚体组件
        this.rigidBody = this.getComponent(RigidBody2D);

        // 注册碰撞检测
        let collider = this.getComponent(BoxCollider2D);
        
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
        
        // 检查碰撞对象是否为其他敌人
        const enemy = otherCollider.getComponent(Enemy);
        if (enemy) {
            // 敌人之间的碰撞由物理引擎处理
            // 这里可以添加额外的敌人之间的交互逻辑
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

        // 使用刚体控制移动
        if (this.target && this.rigidBody) {
            const targetPos = this.target.position;
            const currentPos = this.node.position;
            
            // 计算移动方向
            Vec3.subtract(this.moveDir, targetPos, currentPos);
            this.moveDir.normalize();
            
            // 设置刚体的线性速度
            const velocity = new Vec2(
                this.moveDir.x * this.moveSpeed,
                this.moveDir.y * this.moveSpeed
            );
            
            this.rigidBody.linearVelocity = velocity;
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