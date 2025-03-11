import { _decorator, Component, Node } from 'cc';
import { BaseSkill } from './skills/BaseSkill';
const { ccclass, property } = _decorator;

@ccclass('SkillManager')
export class SkillManager extends Component {
    private skills: BaseSkill[] = [];

    start() {
        // 初始化技能
        this.initializeSkills();
    }

    private initializeSkills() {
        // 获取所有技能组件
        const skillComponents = this.getComponents(BaseSkill);
        
        skillComponents.forEach(skill => {
            if (skill) {
                skill.initialize(this.node.getChildByName('Holder'));
                this.skills.push(skill);
            }
        });
    }

    public addSkill(skillPrefab: Node) {
        const skill = skillPrefab.getComponent(BaseSkill);
        if (skill) {
            // 将技能组件添加到当前节点
            const newSkill = this.addComponent(skill.constructor as typeof BaseSkill);
            newSkill.initialize(this.node);
            this.skills.push(newSkill);
        }
    }

    public levelUpSkill(skillIndex: number) {
        if (skillIndex >= 0 && skillIndex < this.skills.length) {
            this.skills[skillIndex].levelUp();
        }
    }

    public getSkills(): BaseSkill[] {
        return this.skills;
    }
} 