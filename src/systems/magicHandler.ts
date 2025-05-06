import {
  Dimension,
  EntityDamageCause,
  Player,
  system,
  Vector3,
  world,
  Entity,
  MolangVariableMap
} from "@minecraft/server";
import { IProjectileSetting, ISpellRegistry } from "../utils/interfaces";

const playerCache: Record<string, Player> = {};

export function throwableMagicHandler(player: Player, dimension: Dimension, projectileSetting: IProjectileSetting ,spellReg: ISpellRegistry) {
  const viewDir = player.getViewDirection();
  const origin = {
    x: player.location.x + viewDir.x,
    y: player.getHeadLocation().y,
    z: player.location.z + viewDir.z,
  };
  const blockViewDir = player.getBlockFromViewDirection({maxDistance: spellReg.range});
  const entityViewDir = player.getEntitiesFromViewDirection({maxDistance: spellReg.range});


  let targetLocation: Vector3;

  if (entityViewDir.length > 0) {
    targetLocation = entityViewDir[0].entity.location;
  } else if (blockViewDir) {
    targetLocation = blockViewDir.block.location;
  } else {
    targetLocation = {
      x: player.location.x + viewDir.x * spellReg.range,
      y: player.getHeadLocation().y + viewDir.y * spellReg.range,
      z: player.location.z + viewDir.z * spellReg.range,
    };
  }

  let projectile = dimension.spawnEntity("dave:throwable", origin);
  projectile.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${projectileSetting.icon}`);

  const spellProperties = {
    damage: spellReg.damage,
    area_effect: spellReg.area_effect,
    crowd_control: spellReg.crowd_control
  }

  projectile.setDynamicProperty("magic:particle_color", JSON.stringify(projectileSetting.rgba))
  projectile.setDynamicProperty("magic:spell_properties", JSON.stringify(spellProperties));
  projectile.setDynamicProperty("magic:source_id", player.id);
  playerCache[player.id] = player;

  const dx = targetLocation.x - origin.x;
  const dy = targetLocation.y - origin.y;
  const dz = targetLocation.z - origin.z;

  const speed = 4;
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const impulse: Vector3 = {
    x: (dx / length) * speed,
    y: (dy / length) * speed,
    z: (dz / length) * speed
  }

  projectile.applyImpulse(impulse);
}

export function holdableMagicHandler(player: Player, dimension: Dimension, holdSetting: any, spellReg: ISpellRegistry) {
  const [red, green, blue, alpha] = holdSetting.rgba;
  let holdCounter = 0;
  const staticViewDir = player.getViewDirection();
  let pointer = dimension.spawnEntity("dave:pointer", {
    x: player.location.x + staticViewDir.x * 2,
    y: player.location.y + staticViewDir.y * 2,
    z: player.location.z + staticViewDir.z * 2
  });
  const runId = system.runInterval(() => {
    if (!player.isValid()) {
      system.clearRun(runId);
      return;
    }

    holdCounter++;
    if (holdCounter >= holdSetting.holdDuration) {
      system.clearRun(runId);
      return;
    }
    if (holdSetting.screenShake === true) player.runCommand('camerashake add @s 0.05 0.1 positional');
    const viewDir = player.getViewDirection();
    const origin = {
      x: player.location.x + viewDir.x,
      y: player.getHeadLocation().y,
      z: player.location.z + viewDir.z,
    };
    
    const length: Vector3 = {
      x: viewDir.x * holdSetting.speed,
      y: viewDir.y * holdSetting.speed,
      z: viewDir.z * holdSetting.speed
    }

    const molang = new MolangVariableMap();
    molang.setFloat("variable.dir_x", length.x);
    molang.setFloat("variable.dir_y", length.y);
    molang.setFloat("variable.dir_z", length.z);
    molang.setFloat("variable.color_red", red);
    molang.setFloat("variable.color_green", green);
    molang.setFloat("variable.color_blue", blue);
    molang.setFloat("variable.color_alpha", alpha);
    molang.setFloat("variable.particle_speed", holdSetting.speed);
    molang.setFloat("variable.max_age", holdSetting.particle_maxAge);

    dimension.spawnParticle("magic:breath", origin, molang);
    pointer.teleport({
      x: player.location.x + staticViewDir.x * spellReg.range,
      y: player.location.y + staticViewDir.y * spellReg.range,
      z: player.location.z + staticViewDir.z * spellReg.range
    });
    if (holdCounter % 5 === 1) {
      const entityViewDir = player.getEntitiesFromViewDirection({ maxDistance: spellReg.range })[0];
      if (!entityViewDir) return;
      dimension.getEntities({
        location: pointer.location,
        maxDistance: spellReg.area_effect
      }).forEach(entity => {
        if (entity.id === player.id || entity.typeId === "minecraft:item") return;
        entity.applyDamage(spellReg.damage, {
          cause: EntityDamageCause.fire,
          damagingProjectile: player
        });
      });
    }
  });
}


system.afterEvents.scriptEventReceive.subscribe(({
  message,
  id,
  sourceEntity
}) => {
  if (sourceEntity?.typeId === "dave:throwable") {
    if (id === "magic:effect") {
      let projectile = sourceEntity;
      let particleColor = JSON.parse(projectile.getDynamicProperty("magic:particle_color") as string) as number[];
      let spellProperties = JSON.parse(projectile.getDynamicProperty("magic:spell_properties") as string) as any;
      let sourceId = projectile.getDynamicProperty("magic:source_id") as string;
      let dimension = world.getDimension(projectile.dimension.id);

      const sourcePlayer = world.getPlayers().find(p => p.id === sourceId);

      dimension.getEntities({
        maxDistance: spellProperties.area_effect,
        location: projectile.location
      }).forEach(entity => {
        if (entity.id === sourceId || entity.typeId === "minecraft:item") return;
        let [red, green, blue, alpha] = particleColor;
        let molang = new MolangVariableMap();
        molang.setFloat("variable.radius", spellProperties.area_effect);
        molang.setFloat("variable.color_red", red);
        molang.setFloat("variable.color_green", green);
        molang.setFloat("variable.color_blue", blue);
        molang.setFloat("variable.color_alpha", alpha);

        dimension.spawnParticle("magic:explode", projectile.location, molang);
        const dist = Math.sqrt(
          (entity.location.x - projectile.location.x) ** 2 +
          (entity.location.y - projectile.location.y) ** 2 +
          (entity.location.z - projectile.location.z) ** 2
        );
        const falloff = Math.max(0.25, 1 - (dist / spellProperties.area_effect));
        const scaledDamage = Math.floor(spellProperties.damage * falloff);
        // console.warn(scaledDamage)
        entity.applyDamage(scaledDamage, {
          cause: EntityDamageCause.fire,
          damagingProjectile: sourcePlayer as Player,
        });
      });
      projectile.remove()
    }
  }
})