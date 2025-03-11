import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { Enemy } from '../scripts/Enemy';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    @property(Node)
    private player: Node = null;
    
    @property(Prefab)
    private enemyPrefab: Prefab = null;
    
    // 游戏状态
    private gameTime: number = 0;
    private score: number = 0;
    private isGameOver: boolean = false;
    
    // 敌人生成控制
    private enemySpawnTimer: number = 0;
    private spawnInterval: number = 2; // 每2秒生成一个敌人
    
    start() {
        this.initGame();
    }
    
    update(deltaTime: number) {
        if (this.isGameOver) return;
        
        this.gameTime += deltaTime;
        this.updateEnemySpawn(deltaTime);
    }
    
    private initGame() {
        this.gameTime = 0;
        this.score = 0;
        this.isGameOver = false;
        this.enemySpawnTimer = 0;
    }

    private updateEnemySpawn(deltaTime: number) {
        this.enemySpawnTimer += deltaTime;
        
        if (this.enemySpawnTimer >= this.spawnInterval) {
            this.enemySpawnTimer = 0;
            this.spawnEnemy();
        }
    }

    private spawnEnemy() {
        if (!this.enemyPrefab) return;
        
        // 在屏幕边缘随机位置生成敌人
        const enemy = instantiate(this.enemyPrefab);
        this.node.addChild(enemy);
        
        // 设置随机位置
        const randomPos = this.getRandomSpawnPosition();
        enemy.setPosition(randomPos);
        
        // 设置目标为玩家
        const enemyComp = enemy.getComponent(Enemy);
        if (enemyComp) {
            enemyComp.target = this.player;
        }
    }

    private getRandomSpawnPosition(): Vec3 {
        // 这里需要根据实际游戏场景大小调整
        const radius = 600; // 生成半径
        const angle = Math.random() * Math.PI * 2;
        
        return new Vec3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
        );
    }
}


