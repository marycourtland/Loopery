// ========== SETTINGS

// Display constants
game.display.track_width = 8; // px
game.display.track_color = 'white';
game.display.train_radius = 12; // px
game.display.darkened_track_extent = 0.4;
game.display.clicker_offset = 0.08;

game.display.font_title = {size: 72, type: 'Arial'}
game.display.font_large = {size: 36, type: 'Arial'}
game.display.font_normal = {size: 24, type: 'Arial'}
game.display.font_small = {size: 18, type: 'Arial'}
game.display.font_tiny = {size: 12, type: 'Arial'}

game.ctx.fillStyle = 'white'; // default foreground color
game.ctx.strokeStyle = 'white';

game.display.shade_hovered_circle_track = false;

// Other constants
game.train_speed = 5; // pixels per frame. TODO: convert to pixels per second
game.joint_click_radius = 12; // radius of area in which you can click the joining of two tracks
game.joint_click_distance = 20;
