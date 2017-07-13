/*----Attaching game constructor to variable----*/
var connect4 = new game_constructor();

$(document).ready(function() {
    $('.sound_off').click(sound_off);
    $('.sound_on').click(sound_on);
    /*---- Initializes the game----*/
    connect4.init();
});

/*----Sound effect for drop sound on slot insert----*/
function drop(){
    var audio = $("#drop")[0];
    audio.play();
}

/*----Sound effect for either player 1 win or player 2 win----*/
function spongebob_win(){
    var audio = $('#spongebob_laugh')[0];
    audio.play();
}
function patrick_win(){
    var audio = $('#patrick_laugh')[0];
    audio.play();
}

/*----Operations to switch the music on and off----*/
function sound_off() {
    $('.sound_off').hide();
    $('.sound_on').show();
    $('.music')[0].pause();
}

function sound_on(){
    $('.sound_on').hide();
    $('.sound_off').show();
    $('.music')[0].play();
}

/*----Main Game Constructor, sets all the global variables to keep track of the games state----*/
function game_constructor() {
    this.winner_found = false;
    this.player1 = true;
    this.player1_score = 0;
    this.player2_score = 0;
    $('.patrick').hide(); //Hides player 2's token at the beginning of game.
    this.diag1_counter = 0, this.diag2_counter = 0, this.horz_counter = 0, this.vert_counter = 0; //Used to count up matches in a row
    this.direction_tracker = 0; //Detects which direction we are counting

    /*----This array is to update the game board with the correct tokens----*/
    this.div_array = [
        [,,,,,],
        [,,,,,],
        [,,,,,],
        [,,,,,],
        [,,,,,],
        [,,,,,],
        [,,,,,]
    ];

    /*----This array is to keep track of the selected slots on the game board.----*/
    this.game_array = [
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 0
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 1
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 2
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 3
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 4
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 5
        ['a', 'a', 'a', 'a', 'a', 'a']  // column 6
    ];
}

/*This is what happens when game is initiated. Board is reset, score is reset, applies drop sound to each "slot"*/
game_constructor.prototype.init = function() { //initiate game

    this.create_divs(this); //create game board

    $('.new_game').click(function() {
        connect4.reset_board();
    });
    $('.reset_score').click(function(){
        connect4.hard_reset();
    });
    $(".slot").click(drop);
};

/*----This creates the game board slot by slot to create a 7 by 6 table----*/
game_constructor.prototype.create_divs = function() {
    for (var row=6; row > -1 ; row--) {
        for (var column=0; column < 7; column++) {
            var new_slot = new this.slot_constructor(this, column, row );
            new_slot.create_div();
            new_slot.add_class();
            new_slot.krabby_patty();
            this.div_array[column][row] = new_slot;
        }
    }
};

/*----Creates each slot in the board dynamically and applies the classes it needs----*/
game_constructor.prototype.slot_constructor = function(parent, column, row) {
    this.parent = parent;
    this.column = column;
    this.row = row;
    this.selected = false;
    this.location = column.toString() + ' ' + row.toString();
    this.create_div = function() {
        this.slot_div = $('<div>', {
            class: 'slot'
        });
        $('.slot_container').append(this.slot_div);
        this.slot_div.text(this.location);
        this.slot_div.click(this.handle_click.bind(this));
    };
    this.handle_click = function() {
        this.parent.handle_slot_click(this);
    };
    this.add_class = function() { //make top
        if (this.row == 6) {
            $(this.slot_div).addClass('top')
        }
    };
    /*----Puts a random krabby patty slot onto the board!----*/
    this.krabby_patty = function(){ //
        for(var i = 4; i >= 0; i--) {
            if (this.row === Math.floor((Math.random() * 5) + 1) && this.column === Math.floor((Math.random() * 5) + 1)) {
                $(this.slot_div).addClass('krabby_patty');
            }
        }
    };
};

/*---Whether Player 1 or 2 makes a selection this function runs and assigns proper data to the array---*/
game_constructor.prototype.handle_slot_click = function(clickedSlot) {
    var current_column = this.game_array[clickedSlot.column];

    if (this.player1 === true) {
        $('.top').hover(function(){
            $(this).css({"background-image": "url('img/patrick_ready.png')", "background-repeat": "no-repeat", "background-size": "100%"})
        },function(){
            $(this).css("background", "none");
        });
        $('.spongebob').hide()
        $('.patrick').show();
        $('.youare_s').hide();
        $('.youare_p').show();
        this.player1 = false;
        /*---This makes sure that whatever column is clicked the token falls to the bottom as it normally does in connect 4---*/
        var down_to_bottom = current_column.indexOf("a");
        current_column[down_to_bottom] = 'R';

        /*----Adds class to open slot to indicate that player 1 has put their token here----*/
        this.div_array[clickedSlot.column][down_to_bottom].slot_div.toggleClass('selected_slot_p1');
        if($(this.div_array[clickedSlot.column][down_to_bottom].slot_div).is('.krabby_patty')){
            console.log('secret krabby patty clicked!!');
            this.div_array[clickedSlot.column][down_to_bottom].slot_div.toggleClass('krabby_patty_clicked_spongebob');
            $('.slot').hide();
            $('.slot_container').append("<div class='you_won'><img class='patrick_won' src='img/krabbypatty.gif'></div>");
            setTimeout(this.set_timeout_krabby, 3000);
            this.player1 = true;
            $('.youare_s').show();
            $('.youare_p').hide();
            $('.spongebob').show();
            $('.patrick').hide();
            $('.top').hover(function(){
                $(this).css({"background-image": "url('img/spongebob_ready.png')", "background-repeat": "no-repeat", "background-size": "100%"})
            },function(){
                $(this).css("background", "none");
            });
        }

    } else {
        $('.top').hover(function(){
            $(this).css({"background-image": "url('img/spongebob_ready.png')", "background-repeat": "no-repeat", "background-size": "100%"})
        },function(){
            $(this).css("background", "none");
        });
        $('.patrick').hide();
        $('.spongebob').show();
        $('.youare_p').hide();
        $('.youare_s').show();
        this.player1 = true;
        var down_to_bottom = current_column.indexOf("a");
        current_column[down_to_bottom] = 'B';
        this.div_array[clickedSlot.column][down_to_bottom].slot_div.toggleClass('selected_slot_p2');
        if($(this.div_array[clickedSlot.column][down_to_bottom].slot_div).is('.krabby_patty')){
            console.log('secret krabby patty clicked!!');
            this.div_array[clickedSlot.column][down_to_bottom].slot_div.toggleClass('krabby_patty_clicked_patrick');
            $('.slot').hide();
            $('.slot_container').append("<div class='you_won'><img class='patrick_won' src='img/krabbypatty.gif'></div>");
            setTimeout(this.set_timeout_krabby, 3000);
            this.player1 = false;
            $('.youare_s').hide();
            $('.youare_p').show();
            $('.spongebob').hide();
            $('.patrick').show();
            $('.top').hover(function(){
                $(this).css({"background-image": "url('img/patrick_ready.png')", "background-repeat": "no-repeat", "background-size": "100%"})
            },function(){
                $(this).css("background", "none");
            });
        }
    }

    /*----Checks win condition to see if player 1 or 2 has got 4 tokens in a row----*/
    this.search_surrounding_slots(clickedSlot.column, down_to_bottom);
};

/*----Shows "krabby patty found" screen and after 3 seconds displays alert to show another turn is rewarded----*/
game_constructor.prototype.set_timeout_krabby = function(){
    $('.you_won').hide();
    $('.slot').show();
    window.alert('Krabby Patty Found! Take another turn!')
};

/*----Empties the board that way another game can be played and arrays are reset----*/
game_constructor.prototype.reset_board = function(){
    $('.slot_container').empty();
    this.init();
    this.player1 = true;
    $('.spongebob').show();
    $('.patrick').hide();
    this.game_array = [
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 0
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 1
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 2
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 3
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 4
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 5
        ['a', 'a', 'a', 'a', 'a', 'a']  // column 6
    ];
    $('.youare_p').hide();
    $('.youare_s').show();
    this.winner_found = false;
};

/*----Resets the board as well as the scoreboard which keeps track of the wins of each player----*/
game_constructor.prototype.hard_reset = function() {
    $('.slot_container').empty();
    this.init();
    this.player1 = true;
    $('.spongebob').show();
    $('.patrick').hide();
    this.game_array = [
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 0
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 1
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 2
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 3
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 4
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 5
        ['a', 'a', 'a', 'a', 'a', 'a']  // column 6
    ];
    this.player1_score = 0;
    this.player2_score = 0;
    this.display_stats();
    $('.youare_p').hide();
    $('.youare_s').show();
    this.winner_found = false;

};

/*-----Displays stats to the stats container-----*/
game_constructor.prototype.display_stats = function(){
    $('.player1_score').text(this.player1_score);
    $('.player2_score').text(this.player2_score);
};

/*----Win Condition here, It will search in each direction and stop at the end of the board to check for 4 in a row----*/
game_constructor.prototype.search_surrounding_slots = function (array, index) {
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            if (this.winner_found === true) {return};
            /*Checks happen from the bottom of a column to the top, then moves and checks the next column in the same fashion.*/
            /*Each direction is given a value of 1-9 and adds to the appropriate counter based on the switch statement below.*/
            this.direction_tracker++;

            /*This if statement checks to make sure we're not out of bounds or counting the newly placed token itself*/
            if (!(j == 0 && i == 0) && array + i > -1 && array + i < 7 && index + j > -1 && index + j < 6) {
                var move_array_position = i;
                var move_index_position = j;
                /*This while statement allows the check to continue along the same path
                for example, if its checking the slot to the top right and finds a match,
                it will continue checking in that direction and add onto the appropriate counter.*/
                while (this.game_array[array + move_array_position][index + move_index_position] === this.game_array[array][index]) {
                    this.increase_counters(this.direction_tracker);

                    /*Checks to see if any of the counters have reached a winning value*/
                    if (this.diag1_counter === 3 || this.diag2_counter === 3 || this.horz_counter === 3 || this.vert_counter === 3) {
                        console.log('you win!');
                        $('.slot_container').attr('disabled', 'true');
                        this.who_wins();
                        break;
                    }

                    /*Increases coordinates in same direction and then checks to see if we're out of bounds before continuing another check.*/
                    move_array_position = move_array_position + i;
                    move_index_position = move_index_position + j;
                    if (array + move_array_position < 0 || array + move_array_position > 6 || index + move_index_position < 0 || index + move_index_position > 5) {
                        break

                    }
                }
            }
        }
    }
    this.reset_counters();
};

/*----If player 1 wins then spongebob animation will display, player 2 will display Patrick----*/
game_constructor.prototype.who_wins = function(){
    if(this.player1 === false){
        console.log('spongebob won!');
        spongebob_win();
        $('.youare_p').hide();
        $('.youare_s').show();
        $('.slot').hide();
        $('.slot_container').append("<div class='you_won'><img class='spongebob_won' src='img/spongebob_wins.gif'></div>");
        this.player1_score++;
        this.display_stats();
        this.winner_found = true;
    }else{
        $('.youare_p').show();
        $('.youare_s').hide();
        $('.slot').hide();
        console.log('patrick won!');
        patrick_win();
        $('.slot_container').append("<div class='you_won'><img class='patrick_won' src='img/patrick_wins.gif'></div>");
        this.player2_score++;
        this.display_stats();
        this.winner_found = true;
    }
    // this.update_firebase('empty', false, false, false, true, -1);


};

/*----This method will increase the global variables to see how many in a row each player has----*/
game_constructor.prototype.increase_counters = function(direction_tracker) {
    switch (direction_tracker) {
        case 1:
        case 9:
            this.diag1_counter++;
            break;
        case 2:
        case 8:
            this.horz_counter++;
            break;
        case 3:
        case 7:
            this.diag2_counter++;
            break;
        case 4:
        case 6:
            this.vert_counter++;
            break;
    }
};

/*----This method will reset globals on each check for win condition.----*/
game_constructor.prototype.reset_counters = function () {
    this.diag1_counter = 0;
    this.diag2_counter = 0;
    this.horz_counter = 0;
    this.vert_counter = 0;
    this.direction_tracker = 0;
};