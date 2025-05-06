import { GameMode } from "@minecraft/server";
export class ManaSystem {
    constructor(player) {
        this.player = player;
        this.currentMana = player.getDynamicProperty("dave:currentMana") ?? 0;
    }
    reduceMana(amount) {
        this.currentMana -= amount;
        if (this.currentMana < 0)
            this.currentMana = 0;
        this.player.setDynamicProperty("dave:currentMana", this.currentMana);
        this.updateManaBar();
    }
    addMana(amount, isGoldenMana) {
        const wasGoldenMana = this.currentMana > 10;
        if (wasGoldenMana && !isGoldenMana) {
            return;
        }
        this.currentMana += amount;
        if (wasGoldenMana || isGoldenMana) {
            if (this.currentMana > 20)
                this.currentMana = 20;
        }
        else {
            if (this.currentMana > 10)
                this.currentMana = 10;
        }
        this.player.setDynamicProperty("dave:currentMana", this.currentMana);
        this.updateManaBar();
    }
    updateManaBar() {
        let nx = Math.ceil(this.currentMana / 10);
        let pv = nx - 1;
        if (nx > 2)
            nx = 2;
        if (pv > 1)
            pv = 1;
        if (nx < 1)
            nx = 1;
        if (pv < 0)
            pv = 0;
        let maxOfCurrentLayer = nx * 10;
        let mn = maxOfCurrentLayer - this.currentMana;
        if (mn > 9)
            mn = 9;
        if (mn < 0)
            mn = 0;
        this.player.onScreenDisplay.setTitle(`Mn:${mn.toString().padStart(2, "0")};Nx:${nx};Pv:${pv}`);
    }
    isManaEnough(manaRequired) {
        let isAllowed = false;
        if (this.currentMana >= manaRequired || this.player.getGameMode() === GameMode.creative) {
            isAllowed = true;
        }
        return isAllowed;
    }
}
