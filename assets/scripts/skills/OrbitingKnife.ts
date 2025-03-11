import { _decorator, Node, Prefab, instantiate, Vec3, math } from 'cc';
import { BaseSkill } from './BaseSkill';
import { Enemy } from '../Enemy';
const { ccclass, property } = _decorator;

@ccclass('OrbitingKnife')
export class OrbitingKnife extends BaseSkill {
    @property(Prefab)
    public knifePrefab: Prefab = null;

    public orbitRadius: number = 100; // 环绕半径
    public rotationSpeed: number = 120; // 旋转速度（度/秒）
    public knifeCount: number = 8; // 飞刀数量

    private knives: Node[] = [];
    private currentAngle: number = 0;

    start() {
        this.createKnives();
    }

    private createKnives() {
        // 清除现有的飞刀
        this.knives.forEach(knife => knife.destroy());
        this.knives = [];

        // 创建新的飞刀
        const angleStep = 360 / this.knifeCount;
        for (let i = 0; i < this.knifeCount; i++) {
            const knife = instantiate(this.knifePrefab);
            this.owner.addChild(knife);
            this.knives.push(knife);

            // 设置初始位置和角度
            const angle = i * angleStep;
            const position = this.getKnifePosition(angle);
            knife.setPosition(position);
            // 设置飞刀角度，使其垂直于环绕方向（假设飞刀图片默认朝上）
            knife.angle = angle + 90;
        }
    }

    private getKnifePosition(angle: number): Vec3 {
        const radian = math.toRadian(angle);
        const x = Math.cos(radian) * this.orbitRadius;
        const y = Math.sin(radian) * this.orbitRadius;
        return new Vec3(x, y, 0);
    }

    update(deltaTime: number) {
        // 更新飞刀位置
        this.currentAngle += this.rotationSpeed * deltaTime;
        if (this.currentAngle >= 360) {
            this.currentAngle -= 360;
        }

        const angleStep = 360 / this.knifeCount;
        this.knives.forEach((knife, index) => {
            const angle = this.currentAngle + (index * angleStep);
            const position = this.getKnifePosition(angle);
            knife.setPosition(position);
            // 更新飞刀角度，使其垂直于环绕方向
            knife.angle = angle + 90;
        });

        // 检测碰撞
        this.checkCollision();
    }

    private checkCollision() {
        // 获取场景中的所有敌人
        const enemies = this.node.scene.getComponentsInChildren(Enemy);
        
        this.knives.forEach(knife => {
            const knifePos = knife.worldPosition;
            
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                
                const enemyPos = enemy.node.worldPosition;
                const distance = Vec3.distance(knifePos, enemyPos);
                
                // 如果敌人在飞刀范围内，造成伤害
                if (distance <= this.range) {
                    enemy.takeDamage(this.damage);
                }
            });
        });
    }

    protected onLevelUp() {
        super.onLevelUp();
        
        // 升级效果：增加伤害和飞刀数量
        this.damage += 5;
        if (this.level % 2 === 0) { // 每2级增加一把飞刀
            this.knifeCount++;
            this.createKnives();
        }
    }
} 