// ========== SETTINGS

// Display constants
loopery.display.track_width = 6; // px
loopery.display.track_color = 'white';
loopery.display.orb_radius = 12; // px
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

loopery.display.track_color = 'white';

loopery.display.joint_click_color = 'black';
loopery.display.joint_click_max_alpha = 0.7;
loopery.display.joint_click_pulse_period = 100; // frames per pulse. TODO: cache the alpha values
loopery.display.joint_click_mouse_distance = 50; // pixels



// Other constants
// loopery.orb_speed = 5; // pixels per frame. TODO: convert to pixels per second
loopery.orb_speed = 300; // pixels per second
loopery.joint_click_radius = 15; // radius of area in which you can click the joining of two tracks
loopery.joint_click_distance = 0; // distance of clicker from intersection point between loop and connector
