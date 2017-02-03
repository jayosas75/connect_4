var connect4 = new game_constructor();
var connect4Model = new GenericFBModel('spongeBob-connect4-derrick', boardUpdated);

var emptyObject = {
    column: 'empty'
};



function boardUpdated(data){
    console.log('data from the server: ', data);
}

$(document).ready(function() {
    select_game_mode();
});

function audio_controls() {
    $('.material-icons').toggleClass('muted');
    $('.music')[0].paused ? $('.music')[0].play() : $('.music')[0].pause();
}

function game_constructor() {
    this.refresh_counter = 0;
    this.auto_click_here = null;
    this.player_turn = null;
    this.data_received_from_server = {};
    this.moves_so_far = [];
    this.player1 = true; // variable used to detect player turn
    this.player1_score = 0;
    this.player2_score = 0;
    $('.patrick').hide();
    this.diag1_counter = 0, this.diag2_counter = 0, this.horz_counter = 0, this.vert_counter = 0;
    this.direction_tracker = 0;
    this.div_array = [
        [,,,,,],
        [,,,,,],
        [,,,,,],
        [,,,,,],
        [,,,,,],
        [,,,,,],
        [,,,,,]
    ];
    this.game_array = [ // used to keep track of selected slots on game board. also used as an index for the div_array
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 0
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 1
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 2
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 3
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 4
        ['a', 'a', 'a', 'a', 'a', 'a'], // column 5
        ['a', 'a', 'a', 'a', 'a', 'a']  // column 6
    ];
}

function select_game_mode() {
    var game_modes_div = $('<div>', {
        class: 'game_modes'
    });
    var img_local = $('<img>', {
        src: 'img/local.png'
    });
    var img_multi = $('<img>', {
        src: 'img/multi.png'
    });
    var reset_db_div = $('<div>', {
        class: 'reset_db_div'
    });
    game_modes_div.append(img_local, img_multi, reset_db_div);
    $('.slot_container').append(game_modes_div);

    setTimeout(function() {
        $('.game_modes img:nth-child(1)').click(function() {
            $('.slot_container').empty();
            console.log('local selected');
            connect4.init();
        });

        $('.game_modes img:nth-child(2)').click(function() {
            $('.slot_container').empty();
            console.log('multi selected');
            connect4.multiplayer = true;
            connect4.waiting_for_player_2();
        });

        $('.game_modes div:nth-child(3)').click(function() {
            console.log('reset DB selected');
            connect4Model.saveState(emptyObject);
        });
    },1000);

}
game_constructor.prototype.waiting_for_player_2 = function() {
    // $('.slot_container').empty();
    // $('.slot_container').css('background-color', 'red'); // need to add a graphic on waiting for player
    // if(connect4.data_received_from_server.player2joined === false) { //need to look into passing 'this' after setTimeout calls function again
    //     console.log('waiting for player 2');
    //     setTimeout(connect4.waiting_for_player_2, 1000);
    //     return;
    // }
    // $('.slot_container').css('background-color', '');
    connect4.init();

}


game_constructor.prototype.init = function() {

    this.create_divs(this);

    $('.new_game').click(function() {
        console.log('new game button clicked');
        connect4.reset_board();
    });
    $('.reset_all').click(function(){
        console.log('reset stats and board');
        connect4.hard_reset();
    });
    $('.material-icons').click(audio_controls);
};
// create slot objects and corresponding divs
game_constructor.prototype.create_divs = function() {
    for (var row=6; row > -1 ; row--) {
        for (var column=0; column < 7; column++) {
            var new_slot = new this.slot_constructor(this, column, row );
            new_slot.create_div();
            new_slot.add_class();
            this.div_array[column][row] = new_slot;
        }
    }
};

// definition for slot object
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
    this.add_class = function() {
        if (this.row == 6) {
            $(this.slot_div).addClass('top')
        }
    }
};

game_constructor.prototype.handle_slot_click = function(clickedSlot) {
    var current_column = this.game_array[clickedSlot.column];
    this.moves_so_far.push(clickedSlot.column);
    console.log('moves: ', this.moves_so_far);

    if (this.player1 === true) {
        $('.top').hover(function(){
            $(this).css({"background-image": "url('img/patrick_ready.png')", "background-repeat": "no-repeat", "background-size": "100%"})
        },function(){
            $(this).css("background", "none");
        });
        $('.spongebob').hide();
        $('.patrick').show();
        //console.log('Player 1 has clicked', clickedSlot);
        this.player1 = false;
        var down_to_bottom = current_column.indexOf("a"); // finds the first 'a' in the column
        current_column[down_to_bottom] = 'R'; // puts the player indicator at the 'bottom' of the array where the 'a' was found
        this.div_array[clickedSlot.column][down_to_bottom].slot_div.toggleClass('selected_slot_p1'); // applies class to div using the div_array (array containing objects)

    } else {
        $('.top').hover(function(){
            $(this).css({"background-image": "url('img/spongebob_ready.png')", "background-repeat": "no-repeat", "background-size": "100%"})
        },function(){
            $(this).css("background", "none");
        });
        $('.patrick').hide();
        $('.spongebob').show();
        //console.log('Player 2 has clicked', clickedSlot);
        this.player1 = true;
        var down_to_bottom = current_column.indexOf("a");
        current_column[down_to_bottom] = 'B';
        this.div_array[clickedSlot.column][down_to_bottom].slot_div.toggleClass('selected_slot_p2');
    }

    this.search_surrounding_slots(clickedSlot.column, down_to_bottom);

};

game_constructor.prototype.refresh_gameboard = function() {

    $('.slot_container').empty();
    this.init();
    for (var i = 0; i < this.moves_so_far.length; i++) {
        this.auto_click_here = this.moves_so_far[i] + ' 6';
        var input_into_jquery_selector = 'div>div:contains(' + this.auto_click_here + ')';
        $(input_into_jquery_selector).click();
    }

};

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
};

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
};

game_constructor.prototype.display_stats = function(){
    //console.log('********* method display_stats called**************');
    $('.player1_score').text(this.player1_score);
    $('.player2_score').text(this.player2_score);
};

game_constructor.prototype.search_surrounding_slots = function (array, index) {
    //console.log('********* method search_slots called**************');
    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {

            // checks happen from the bottom of a column to the top, then moves and checks the next column in the same fashion.
            // each direction is given a value of 1-9 and adds to the appropriate counter based on the switch statement below.
            this.direction_tracker++;

            // this if statement checks to make sure we're not out of bounds or counting the newly placed token itself
            if (!(j == 0 && i == 0) && array + i > -1 && array + i < 7 && index + j > -1 && index + j < 6) {
                var move_array_position = i;
                var move_index_position = j;
                //console.log('checking at: ' + (array + i) + ', ' + (index + j));

                // this while statement allows the check to continue along the same path
                // for example, if its checking the slot to the top right and finds a match,
                // it will continue checking in that direction and add onto the appropriate counter.
                while (this.game_array[array + move_array_position][index + move_index_position] === this.game_array[array][index]) {
                    this.increase_counters(this.direction_tracker);

                    //console.log('match found at: ' + (array + move_array_position) + ', ' + (index + move_index_position));

                    // checks to see if any of the counters have reached a winning value
                    if (this.diag1_counter === 3 || this.diag2_counter === 3 || this.horz_counter === 3 || this.vert_counter === 3) {
                        console.log('you win!');
                        $('.slot_container').attr('disabled', 'true');
                        this.who_wins();
                        break;
                    }

                    // increases coordinates in same direction and then checks to see if we're out of bounds before continuing another check.
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

game_constructor.prototype.who_wins = function(){
    //console.log('********* method who_wins called**************');
        if(this.player1 === false){
            console.log('spongebob won!');
            $('.slot').hide();
            $('.slot_container').append("<div class='you_won'><img class='spongebob_won' src='img/spongebob_wins.gif'></div>");
            this.player1_score++;
            this.display_stats();
        }else{
            $('.slot').hide();
            console.log('patrick won!');
            $('.slot_container').append("<div class='you_won'><img class='patrick_won' src='img/patrick_wins.gif'></div>");
            this.player2_score++;
            this.display_stats();
        }
};

game_constructor.prototype.increase_counters = function(direction_tracker) {
    //console.log('********* method increase_counters called**************');
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


game_constructor.prototype.reset_counters = function () {
    //console.log('********* method reset_counters called**************');
    this.diag1_counter = 0;
    this.diag2_counter = 0;
    this.horz_counter = 0;
    this.vert_counter = 0;
    this.direction_tracker = 0;
};



//




