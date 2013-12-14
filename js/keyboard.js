function getKeyFromEvent(event) {
  if (event.preventDefault) event.preventDefault();
  return keycodes[(event.fake||window.event? event.keyCode: event.which)];
}

// Commonly used sets of keys
keydirs_adws = {
  "A": "left",
  "D": "right",
  "W": "up",
  "S": "down"
}
keydirs_lrud = { 
  "LEFT": "left",
  "RIGHT": "right",
  "UP": "up",
  "DOWN": "down"
}

// Commonly used keycodes
keycodes = {};
keycodes[16] = "SHIFT";
keycodes[17] = "CTRL";
keycodes[18] = "ALT";
keycodes[37] = "LEFT";
keycodes[39] = "RIGHT";
keycodes[38] = "UP";
keycodes[40] = "DOWN";
keycodes[32] = "SPACE";
keycodes[13] = "ENTER";
keycodes[189] = "DASH";
keycodes[187] = "EQUALS";
keycodes[107] = "PLUS";
keycodes[109] = "MINUS";
keycodes[65] = "A";
keycodes[66] = "B";
keycodes[67] = "C";
keycodes[68] = "D";
keycodes[69] = "E";
keycodes[70] = "F";
keycodes[71] = "G";
keycodes[72] = "H";
keycodes[73] = "I";
keycodes[74] = "J";
keycodes[75] = "K";
keycodes[76] = "L";
keycodes[77] = "M";
keycodes[78] = "N";
keycodes[79] = "O";
keycodes[80] = "P";
keycodes[81] = "Q";
keycodes[82] = "R";
keycodes[83] = "S";
keycodes[84] = "T";
keycodes[85] = "U";
keycodes[86] = "V";
keycodes[87] = "W";
keycodes[88] = "X";
keycodes[89] = "Y";
keycodes[90] = "Z";
keycodes[188] = "COMMA";
keycodes[190] = "PERIOD";
keycodes[191] = "SLASH";
keycodes[220] = "BSLASH";
keycodes[219] = "RBRACK";
keycodes[221] = "LBRACK";
keycodes[222] = "APOSTOPHE";
keycodes[186] = "SEMICOLON";

    
function config_keyboard(game) {
  game.keyboard = {pressed_keys: []}
  game.isKeyPressed = function(key) {
    return this.keyboard.pressed_keys.indexOf(key) != -1;
  }

  window.addEventListener("keydown", function(event) {
    key = getKeyFromEvent(event);
    if (game.keyboard.pressed_keys.indexOf(key) == -1) game.keyboard.pressed_keys.push(key);
  });
  
  window.addEventListener("keyup", function(event) {
    key = getKeyFromEvent(event);
    if (game.keyboard.pressed_keys.indexOf(key) != -1)
      removeFromArray(game.keyboard.pressed_keys.indexOf(key), game.keyboard.pressed_keys);
  });

}