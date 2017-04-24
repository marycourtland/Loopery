// ========== FEATURES THAT CAN BE TURNED ON OR OFF
loopery.features = {};


// loopery.features.clickerDisplay = 'pulse-all';
// loopery.features.clickerDisplay = 'pulse-current-loop'; // not implemented
// loopery.features.clickerDisplay = 'show-when-mouse-is-near';
loopery.features.clickerDisplay = 'show-all';


// When turned on, the player can click a loop to toggle all its joints
loopery.features.toggleAllJointsOnLoop = false;

// When turned on, the player can only toggle joints on player-occupied loops
// Implications:
// - For single-player-orb levels, the player can't set up a long circuit of tracks
// - If there are multiple orbs, the player could use them as dummies to set up a circuit
loopery.features.clickersOnlyOnPlayerLoops = true;

loopery.features.asyncLevels = true;