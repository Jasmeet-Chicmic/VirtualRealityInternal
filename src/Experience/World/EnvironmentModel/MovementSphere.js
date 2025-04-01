import { Mesh } from "three";
import { MeshBasicMaterial, SphereGeometry } from "three"
import Experience from "../../Experience";

export default class MovementSphere{

    constructor(){
        this.experience = new Experience();
        this.setGeometry()
        this.setMaterial()
        this.addSphere()
    }

    setGeometry(){
        this.sphereGeometry = new SphereGeometry(30,64,64);
    }

    setMaterial(){
        this.sphereMaterial = new MeshBasicMaterial({});
    }


    addSphere(){
        this.mesh = new Mesh(this.sphereGeometry,this.sphereMaterial);
        this.experience.scene.add(this.mesh)
    }
}