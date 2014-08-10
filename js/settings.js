// ========== SETTINGS

// Display constants
loopery.display.track_width = 8; // px
loopery.display.track_color = 'white';
loopery.display.train_radius = 12; // px
loopery.display.darkened_track_extent = 0.4;
loopery.display.clicker_offset = 0.08;

loopery.display.font_title = {size: 72, type: 'Arial'}
loopery.display.font_large = {size: 36, type: 'Arial'}
loopery.display.font_normal = {size: 24, type: 'Arial'}
loopery.display.font_small = {size: 18, type: 'Arial'}
loopery.display.font_tiny = {size: 12, type: 'Arial'}

loopery.ctx.fillStyle = 'white'; // default foreground color
loopery.ctx.strokeStyle = 'white';

loopery.display.shade_hovered_circle_track = false;
loopery.display.shade_hovered_line_track = false;
loopery.display.shade_start_end_tracks = false;

// Other constants
loopery.train_speed = 5; // pixels per frame. TODO: convert to pixels per second
loopery.joint_click_radius = 12; // radius of area in which you can click the joining of two tracks
loopery.joint_click_distance = 20;
