import Experience from '../Experience.js'
import Environment from './Environment.js'
import Museum from "./Museum/Museum.js"
import Intersections from "./Museum/Intersections.js"
import { EVENTS } from '../../Constants.js'
import SphereEnv from './EnvironmentModel/SphereEnv.js'
import Circle from './Circle/Circle.js'
import MovementIndicators from './MovementIndicators/MovementIndicators.js'
import VRSetup from '../Utils/VRSetup.js'
import VideoPlayer3D from '../InteractiveElements/Video.js'
import UIManager from '../2dUI/UIManager.js'
export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera.instance;
        this.renderer = this.experience.renderer.instance
        // Wait for resources
        this.resources.on(EVENTS.READY, () =>
        {
            // Setup
            this.UIManager = new UIManager()
            this.movementIndicators = new MovementIndicators()
            this.videoPlayer = new VideoPlayer3D(this.scene)
            this.sphere = new SphereEnv()
            this.museum = new Museum()
            this.circle = new Circle()
            this.environment = new Environment()
            this.intersectionObj = new Intersections()
            this.vrSetup = new VRSetup(this.renderer, this.scene, this.camera);
        })
    }

    update()
    {
        if(this.fox)
            this.fox.update();
        if(this.intersectionObj)
            this.intersectionObj.update();

        if(this.vrSetup &&this.vrSetup.isPresenting){
            this.vrSetup.update()
        }
    }
}