# SPEC-005: Enhance Planet Model

## Status
complete

## Context
The current `<Planet/>` model in our `WorldCanvas` component is a bit visually plain. It features a basic `meshStandardMaterial` with an emissive sphere for atmosphere. To improve visual interest and support a "moon surface" visual language with dynamic ambiance, we need a custom shader for terrain generation, localized fog effects, orbital particles, and enhanced illumination.

## Requirements
1. **Custom Shader (Moon Surface Effect)**
   - Replace standard simple material setup with procedural noise displacement and texture.
   - Utilize GLSL to give a high-contrast, grayish, cratered lunar look while still reacting to scene lighting.
2. **Localized Fog Effect**
   - Implement an atmospheric glow/dust shell using a volumetric or advanced Fresnel shader.
   - Make the atmosphere feel dense, dusty, and atmospheric rather than just translucent.
3. **Orbital Particle Effects**
   - Render dynamic, floating debris or dust particles around the planet.
   - Rotate and subtly drift particles over time.
4. **Enhanced Illumination**
   - Fine-tune eclipse and rim lights.
   - Introduce strong directional lighting to emphasize the new procedural craters/surface.

## Implementation Plan
1. **Spec Creation**: Create this document and set to `complete`.
2. **Planet.tsx refactor**:
   - Write reusable GLSL noise functions.
   - Inject noise displacement into `onBeforeCompile` of the planet's `meshStandardMaterial` or use a dedicated `shaderMaterial`.
   - Update atmosphere to use a custom fragment shader combining Fresnel effects with noise.
   - Create a new particle system (InstancedMesh or Points) for the orbital ring.
   - Adjust lighting components directly within `<Planet/>`.
3. **Testing**: Run local tests and verify canvas renders properly without throwing WebGL errors.
4. **Status Update**: Move to `complete`.