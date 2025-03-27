import * as BABYLON from 'babylonjs'

function createTransparentMaterialWithTexture(
  scene: BABYLON.Scene,
  name: string,
  texturePath: string
): BABYLON.StandardMaterial {
  const material = new BABYLON.StandardMaterial(name, scene)
  material.specularColor = new BABYLON.Color3(0, 0, 0)

  const texture = new BABYLON.Texture(texturePath, scene)
  texture.hasAlpha = true

  material.diffuseTexture = texture
  material.useAlphaFromDiffuseTexture = true
  material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND

  return material
}

function createTransparentMaterial(
  scene: BABYLON.Scene,
  name: string
): BABYLON.StandardMaterial {
  const material = new BABYLON.StandardMaterial(name, scene)
  material.useAlphaFromDiffuseTexture = true
  material.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND
  material.backFaceCulling = false
  return material
}

export { createTransparentMaterial, createTransparentMaterialWithTexture }
