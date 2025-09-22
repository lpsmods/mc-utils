# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.4] (Pre-release) - 9/22/2025

### Fixes

- Fixed import error in paged_action_form.ts

## [0.0.3] (Pre-release) - 9/18/2025

### General

- AttackUtils now uses the entityAttack damage cause.
- Area detectors now use a dimensionId instead of Dimension.
- Handlers now only subscribe to events if it has been initialized.
- Improved ChunkEvents tick performance.
- `typeId` for all block and item components has been changed to `componentId`.
- Components now validate parameters
- Added function runAllTests
- Added EntityUtils
- Added ViscosityComponent
- Added WorldSettings
- Added PlayerSettings
- Added TileEntityHandler
- Added TileEntityEvent
- Added TileEntityTickEvent
- Added PagedActionForm
- Added PagedActionFormOptions
- Added TileEntityComponent
- Added TileEntityOptions
- Added PagedActionFormEvent
- Added SphereAreaDetector
- Added RectangleAreaDetector
- Removed RadiusDetector
- Removed RectDetector
- Removed WoodenButtonComponent
- Removed StoneButtonComponent
- Removed InfoBookEvent
- Removed WoodenPressurePlateComponent
- Removed StonePressurePlateComponent
- Removed LightWeightedPressurePlateComponent
- Removed HeavyWeightedPressurePlateComponent
- Changed AreaEvents
  - Removed property enter
  - Removed property leave
  - Removed property tick
  - Added property entityEnter
  - Added property entityLeave
  - Added property entityTick
- Changed BlockEvents
  - Removed property enter
  - Removed property leave
  - Removed property inBlockTick
- Changed ItemEvents
  - Removed property hold
  - Removed property releaseHold
  - Removed property holdTick
  - Added property playerHold
  - Added property playerReleaseHold
  - Added property playerHoldTick
- Changed BlockUtils
  - Added matches
- Changed ItemUtils
  - Added matches
- Changed SearchPage
  - Removed property typeId
  - Added property pageId
- Changed EntityUtils
  - Added property dropAll
- Changed PlayerHandler
  - Added function onBreakBlock
  - Added function onBeforeBreakBlock
  - Added function onButtonInput
  - Added function onDimensionChange
  - Added function onEmote
  - Added function onGameModeChange
  - Added function onBeforeGameModeChange
  - Added function onHotbarSelectedSlotChange
  - Added function onInputModeChange
  - Added function onInputPermissionCategoryChange
  - Added function onInteractWithBlock
  - Added function onBeforeInteractWithBlock
  - Added function onInteractWithEntity
  - Added function onBeforeInteractWithEntity
  - Added function onInventoryItemChange
  - Added function onJoin
  - Added function onLeave
  - Added function onPlaceBlock
  - Added function onPlayerSpawn
- Changed EntityMovedEvent
  - Added property movedBlock
  - Added property movedChunk
- Changed EntityEvents
  - Added property entityEnter
  - Added property entityLeave
  - Added property entityInBlockTick
- Changed EntityHandler
  - Added onBeforeInteract
  - Removed property playerInventoryChanged
  - Removed function onPlayerInteract
  - Added function onInteract
  - Removed function remove
  - Added function delete
  - Added removeAll
  - Added getEntities
- Changed ChunkEvents
  - Removed property load
  - Added property playerLoad
  - Removed property unload
  - Added property playerUnload
  - Removed property tick
  - Added property playerLoadedTick
- Changed LootTableHandler
  - Removed function drop
  - Added function generate

### Fixes

- package.main now points to src/index.ts
- Chunk.z now returns the z location instead of the x.

### Components

- FarmlandComponent
  - uses onRandomTick instead of onTick.
- FenceGateComponent
  - Detects walls.
  - Extends the Toggleable component.
- ToggleableComponent
  - Renamed `state` param to `toggle_state`

## [0.0.1] (Pre-release) - 9/2/2025

- Initial release
