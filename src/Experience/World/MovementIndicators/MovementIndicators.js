import * as THREE from 'three'
import Experience from '../../Experience'
import { DoubleSide } from 'three'
import { BoxGeometry } from 'three'
import { RingGeometry } from 'three'


export default class MovementIndicators
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.circlePosOffset = new THREE.Vector3(-0.01, 0.01, -0.01);
        this.camerasToIntersect = this.experience.camerasToIntersect
        this.allIndicators =[]
   
        this.setGeometry()
        this.setTextures()
        this.setMaterial()
       
        if(this.debug.active)
        this.setDebugNormalMesh()
    }
    setDebugNormalMesh(){
        const geometry = new THREE.BufferGeometry();
        geometry.setFromPoints( [ new THREE.Vector3(), new THREE.Vector3() ] );

        this.line = new THREE.Line( geometry, new THREE.LineBasicMaterial() );
        this.experience.scene.add( this.line );
    }
    updatePositionOfDebugNormalMesh(point,n){
        if(this.line){
        const positions = this.line.geometry.attributes.position;
        positions.setXYZ(0, point.x, point.y, point.z);
        positions.setXYZ(1, point.x + n.x * 10, point.y + n.y * 10, point.z + n.z * 10);
        positions.needsUpdate = true;}
    }
    setGeometry()
    {
       this.geometry = new THREE.RingGeometry(0.01, 0.12, 64);
    //    this.geometry = new THREE.BoxGeometry(0.1,0.1,0.1); //vr
    //    this.geometry = new THREE.BoxGeometry(1,1,1); //vr
    }

    setTextures()
    {
        // this.textures = {}

        // this.textures.color = this.resources.items.grassColorTexture
        // this.textures.color.colorSpace = THREE.SRGBColorSpace
        // this.textures.color.repeat.set(1.5, 1.5)
        // this.textures.color.wrapS = THREE.RepeatWrapping
        // this.textures.color.wrapT = THREE.RepeatWrapping

        // this.textures.normal = this.resources.items.grassNormalTexture
        // this.textures.normal.repeat.set(1.5, 1.5)
        // this.textures.normal.wrapS = THREE.RepeatWrapping
        // this.textures.normal.wrapT = THREE.RepeatWrapping
    }

    setMaterial()
    {
        // this.material = new THREE.MeshBasicMaterial({ color: "brown",transparent:true,side:DoubleSide ,opacity:0.5})
    }

    createNewMesh(position,name)
    {
        this.mesh = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({ color: "brown",transparent:true,side:DoubleSide ,opacity:0.5}))
        this.mesh.position.copy(position)
        this.mesh.rotation.y = -Math.PI / 2;
       
        this.mesh.name = name
        // this.mesh.scale.set(3,3,3)
        this.mesh.renderOrder = 3
        this.camerasToIntersect.push(this.mesh)
        this.allIndicators.push(this.mesh)
        this.scene.add(this.mesh)
    }
   

    disableAllIndicators(){
        this.allIndicators.forEach(mesh=>mesh.visible=false)
    }
    enableAllIndicators(destinationPos,currentCameraName){
     
        
        
        this.allIndicators.forEach(mesh=>{
            if(currentCameraName!=mesh.name){
            mesh.visible=true;}
            mesh.lookAt(destinationPos)
        })

    }
    


}