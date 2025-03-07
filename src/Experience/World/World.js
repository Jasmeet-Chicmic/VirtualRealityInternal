import Experience from '../Experience.js'
import Environment from './Environment.js'
import Museum from "./Museum/Museum.js"
import Intersections from "./Museum/Intersections.js"
import { EVENTS } from '../../Constants.js'
import SphereEnv from './EnvironmentModel/SphereEnv.js'
import Circle from './Circle/Circle.js'
import MovementIndicators from './MovementIndicators/MovementIndicators.js'
export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on(EVENTS.READY, () =>
        {
            // Setup
           
            this.movementIndicators = new MovementIndicators()
            this.sphere = new SphereEnv()
            this.museum = new Museum()
            this.circle = new Circle()
            this.environment = new Environment()
            this.intersectionObj = new Intersections()
        })
    }

    update()
    {
        if(this.fox)
            this.fox.update();
        if(this.intersectionObj)
            this.intersectionObj.update();
    }
}