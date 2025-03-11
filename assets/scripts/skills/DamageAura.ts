import { _decorator, Node, Sprite, Color, UIOpacity, tween, Vec3, UITransform, SpriteFrame } from 'cc';
import { BaseSkill } from './BaseSkill';
import { Enemy } from '../Enemy';
const { ccclass, property } = _decorator;

@ccclass('DamageAura')
export class DamageAura extends BaseSkill {
    @property
    public auraRadius: number = 100; // 光环半径

    @property
    public tickInterval: number = 500; // 伤害间隔（毫秒）

    @property(SpriteFrame)
    private icon: SpriteFrame = null;

    private auraNode: Node = null;
    private lastTickTime: number = 0;
    private opacity: UIOpacity = null;

    start() {
        // 设置初始属性
        this.damage = 5; // 每次伤害
        this.range = this.auraRadius;
        
        // 创建光环视觉效果
        this.createAuraEffect();
    }

    private createAuraEffect() {
        // 创建光环节点
        this.auraNode = new Node('Aura');
        this.owner.addChild(this.auraNode);

        // 添加精灵组件
        const sprite = this.auraNode.addComponent(Sprite);
        // 设置为圆形精灵（需要准备一个圆形贴图）
        sprite.spriteFrame = this.icon;

        // 添加 UITransform 组件
        const transform = this.auraNode.addComponent(UITransform);
        transform.setContentSize(100, 100); // 设置初始大小

        // 设置光环大小
        const scale = (this.auraRadius * 2) / transform.width; // 使直径等于光环范围
        this.auraNode.setScale(scale, scale);

        // 添加透明度组件
        this.opacity = this.auraNode.addComponent(UIOpacity);
        this.opacity.opacity = 128; // 半透明

        // 播放呼吸效果
        this.playBreathingEffect();
    }

    private playBreathingEffect() {
        // 创建循环的透明度动画
        tween(this.opacity)
            .repeatForever(
                tween()
                    .to(1, { opacity: 180 })
                    .to(1, { opacity: 128 })
            )
            .start();
    }

    update(deltaTime: number) {
        const currentTime = Date.now();
        
        // 检查是否到达伤害间隔
        if (currentTime - this.lastTickTime >= this.tickInterval) {
            this.dealDamageToEnemiesInRange();
            this.lastTickTime = currentTime;
        }
    }

    private dealDamageToEnemiesInRange() {
        // 获取场景中的所有敌人
        const enemies = this.node.scene.getComponentsInChildren(Enemy);
        const ownerPos = this.owner.worldPosition;
        
        enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const enemyPos = enemy.node.worldPosition;
            const distance = Vec3.distance(ownerPos, enemyPos);
            
            // 如果敌人在光环范围内，造成伤害
            if (distance <= this.range) {
                enemy.takeDamage(this.damage);
                this.createDamageEffect(enemy.node.position);
            }
        });
    }

    private createDamageEffect(position: Vec3) {
        // // 创建一个简单的伤害指示效果
        // const effectNode = new Node('DamageEffect');
        // this.node.scene.addChild(effectNode);
        // effectNode.setWorldPosition(position);

        // // 添加透明度组件
        // const effectOpacity = effectNode.addComponent(UIOpacity);
        
        // // 播放消失动画
        // tween(effectOpacity)
        //     .to(0.3, { opacity: 0 })
        //     .call(() => effectNode.destroy())
        //     .start();
    }

    protected onLevelUp() {
        super.onLevelUp();
        
        // 升级效果
        this.damage += 2; // 增加伤害
        if (this.level % 2 === 0) {
            this.range += 20; // 每2级增加范围
            this.auraRadius = this.range;
            
            // 更新光环大小
            if (this.auraNode) {
                const transform = this.auraNode.getComponent(UITransform);
                if (transform) {
                    const scale = (this.auraRadius * 2) / transform.width;
                    this.auraNode.setScale(scale, scale);
                }
            }
        }
        if (this.level % 3 === 0) {
            this.tickInterval = Math.max(100, this.tickInterval - 50); // 每3级减少伤害间隔
        }
    }

    onDestroy() {
        // 清理光环节点
        if (this.auraNode) {
            this.auraNode.destroy();
        }
    }
} 