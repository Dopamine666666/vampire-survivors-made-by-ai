import { _decorator, Node, Prefab, instantiate, Vec3, Vec2, math } from 'cc';
import { BaseSkill } from './BaseSkill';
import { Enemy } from '../Enemy';
const { ccclass, property } = _decorator;

@ccclass('HomingProjectile')
export class HomingProjectile extends BaseSkill {
    @property(Prefab)
    public projectilePrefab: Prefab = null;

    public projectileSpeed: number = 300; // 子弹速度
    public maxProjectiles: number = 2; // 同时存在的最大子弹数
    public searchRadius: number = 500; // 搜索目标的范围

    private activeProjectiles: Node[] = [];

    start() {
        // 设置初始属性
        this.damage = 20;
        this.cooldown = 800; // 2秒发射一次
        this.range = 20; // 碰撞检测范围
    }

    update(deltaTime: number) {
        // 更新所有子弹的位置
        this.updateProjectiles(deltaTime);
        
        // 检查是否可以发射新的子弹
        if (this.canCast() && this.activeProjectiles.length < this.maxProjectiles) {
            this.cast();
        }
    }

    protected onCast() {
        // 寻找最近的敌人
        const target = this.findNearestEnemy();
        if (!target) return;

        // 创建子弹
        const projectile = instantiate(this.projectilePrefab);
        this.owner.parent.addChild(projectile); // 添加到玩家所在的父节点
        
        // 设置初始位置（从玩家位置发射）
        projectile.setWorldPosition(this.owner.worldPosition);
        
        // 存储目标信息到子弹节点上
        projectile['target'] = target;
        projectile['damage'] = this.damage;
        projectile['range'] = this.range;
        projectile['speed'] = this.projectileSpeed;
        
        this.activeProjectiles.push(projectile);
    }

    private findNearestEnemy(): Enemy {
        const enemies = this.node.scene.getComponentsInChildren(Enemy);
        let nearestEnemy: Enemy = null;
        let minDistance = this.searchRadius;
        const ownerPos = this.owner.worldPosition;

        enemies.forEach(enemy => {
            if (enemy.isDead) return;
            
            const distance = Vec3.distance(ownerPos, enemy.node.worldPosition);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        });

        return nearestEnemy;
    }

    private updateProjectiles(deltaTime: number) {
        // 更新每个子弹的位置和检查碰撞
        for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.activeProjectiles[i];
            const target = projectile['target'] as Enemy;
            
            // 如果目标已死亡或不存在，销毁子弹
            if (!target || target.isDead) {
                projectile.destroy();
                this.activeProjectiles.splice(i, 1);
                continue;
            }

            // 计算追踪方向
            const currentPos = projectile.position;
            const targetPos = target.node.position;
            const direction = new Vec2(
                targetPos.x - currentPos.x,
                targetPos.y - currentPos.y
            );
            direction.normalize();

            // 更新子弹位置和角度
            const speed = projectile['speed'] as number;
            const newPos = new Vec3(
                currentPos.x + direction.x * speed * deltaTime,
                currentPos.y + direction.y * speed * deltaTime,
                0
            );
            projectile.setPosition(newPos);

            // 设置子弹朝向
            const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
            projectile.angle = angle - 90; // -90是为了让子弹图片朝向正确的方向（假设子弹图片原本朝上）

            // 检查碰撞
            const distance = Vec2.distance(
                new Vec2(newPos.x, newPos.y),
                new Vec2(targetPos.x, targetPos.y)
            );
            if (distance <= projectile['range']) {
                target.takeDamage(projectile['damage']);
                projectile.destroy();
                this.activeProjectiles.splice(i, 1);
            }
        }
    }

    protected onLevelUp() {
        super.onLevelUp();
        
        // 升级效果
        this.damage += 10;
        if (this.level % 2 === 0) {
            this.maxProjectiles += 1; // 每2级增加一个子弹
        }
        if (this.level % 3 === 0) {
            this.cooldown = Math.max(500, this.cooldown - 300); // 每3级减少发射间隔
        }
    }
} 