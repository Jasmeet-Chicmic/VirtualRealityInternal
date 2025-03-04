import Experience from '../Experience.js'
import Environment from './Environment.js'
import Museum from "./Museum/Museum.js"
import Intersections from "./Museum/Intersection.js"
export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources
        this.resources.on('ready', () =>
        {
            // Setup
            // this.floor = new Floor()
            // this.fox = new Fox()
            this.intersectionObj = new Intersections()
            this.museum = new Museum()
            this.environment = new Environment()
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