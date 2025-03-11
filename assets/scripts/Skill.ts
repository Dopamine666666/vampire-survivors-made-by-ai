import { Component, _decorator } from "cc";
const { ccclass, property } = _decorator;

@ccclass('Skill')
export class Skill extends Component {
    @property
    public damage: number = 20;
    
    @property
    public cooldown: number = 1000; //unit:ms
} 