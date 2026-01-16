class Connect4 {
    constructor() {
        this.winner_found = false;
        this.player1 = true; // true = Player 1 (Spongebob), false = Player 2 (Patrick)
        this.player1_score = 0;
        this.player2_score = 0;

        // Win counters
        this.diag1_counter = 0;
        this.diag2_counter = 0;
        this.horz_counter = 0;
        this.vert_counter = 0;
        this.direction_tracker = 0;

        // Board Data
        this.div_array = [
            [, , , , ,], [, , , , ,], [, , , , ,], [, , , , ,], [, , , , ,], [, , , , ,], [, , , , ,]
        ];

        this.game_array = [
            ['a', 'a', 'a', 'a', 'a', 'a'], // col 0
            ['a', 'a', 'a', 'a', 'a', 'a'], // col 1
            ['a', 'a', 'a', 'a', 'a', 'a'], // col 2
            ['a', 'a', 'a', 'a', 'a', 'a'], // col 3
            ['a', 'a', 'a', 'a', 'a', 'a'], // col 4
            ['a', 'a', 'a', 'a', 'a', 'a'], // col 5
            ['a', 'a', 'a', 'a', 'a', 'a']  // col 6
        ];

        // UI Elements Cache
        this.els = {
            slotContainer: document.querySelector('.slot_container'),
            soundOn: document.querySelector('.sound_on'),
            soundOff: document.querySelector('.sound_off'),
            music: document.getElementById('music'),
            patrick: document.querySelector('.patrick'),
            spongebob: document.querySelector('.spongebob'),
            youare_p: document.querySelector('.youare_p'), // Patrick "You Are"
            youare_s: document.querySelector('.youare_s'), // Spongebob "You Are"
            p1Score: document.querySelector('.player1_score'),
            p2Score: document.querySelector('.player2_score'),
            newGameBtn: document.querySelector('.new_game'),
            resetScoreBtn: document.querySelector('.reset_score'),
            topRow: [] // Will populate
        };
    }

    init() {
        this.setupEventListeners();
        this.createBoard();

        // Initial State
        this.els.patrick.style.display = 'none'; // Hide Patrick initially
        this.els.youare_p.style.display = 'none'; // Hide Patrick text
    }

    setupEventListeners() {
        // Sound Toggles
        this.els.soundOn.addEventListener('click', () => this.toggleSound(true));
        this.els.soundOff.addEventListener('click', () => this.toggleSound(false));

        // Game Controls
        this.els.newGameBtn.addEventListener('click', () => this.resetBoard());
        this.els.resetScoreBtn.addEventListener('click', () => this.hardReset());
    }

    toggleSound(isOffClicked) {
        if (isOffClicked) {
            this.els.soundOn.style.display = 'none';
            this.els.soundOff.style.display = 'block';
            this.els.music.play();
        } else {
            this.els.soundOff.style.display = 'none';
            this.els.soundOn.style.display = 'block';
            this.els.music.pause();
        }
    }

    /* Board Creation */
    createBoard() {
        this.els.slotContainer.innerHTML = ''; // Clear existing
        // Create 7 columns x 6 rows
        // Note: The original loop was row=6 downto -1? Original logic:
        // for (var row=6; row > -1 ; row--) { for (var column=0; column < 7; column++) ... }
        // The original code made 7 * 8 = 56 slots??
        // Wait, original: `for (var row=6; row > -1 ; row--)` runs 6,5,4,3,2,1,0 -> 7 iterations?
        // But `create_divs` pushes into `div_array[column][row]`.
        // The board is usually 6 rows high (0-5) or (1-6).
        // Let's stick to standard Connect 4: 7 cols, 6 rows.
        // Original logic seemed to make 7 rows??
        // Let's look closer at original: `row > -1` -> 6,5,4,3,2,1,0. That's 7 rows.
        // But array init was `[,,,,,]` (length 6 commas? no, `[,,,]` is length 3 empty items).
        // `[,,,,, ]` is length 5? No. `new Array(6)`
        // `this.game_array` has 6 'a's per column. Indices 0-5.
        // So row 6 (top) was probably extra or the "drop zone"? 
        // Original: `if (this.row == 6) { $(this.slot_div).addClass('top') }`
        // So row 6 is the clickable top area?
        // Actually, in the original code, `row=6` is the top. 0 is bottom?
        // Let's stick to the visual grid. 
        // We will generate just the visual grid (rows 5 down to 0).
        // The "Top" hover effect can be applied to the top-most visual slot or the entire column.

        // To strictly maintain logic, I will replicate 7 rows if that's what it did, 
        // OR better: Just map the 7x6 grid and handle clicks on ANY slot in the column to drop.

        // Correct approach for C4 refactor:
        // Render 7 columns. Each column captures clicks.
        // Visual slots are just display.

        // Let's recreate the DOM structure expected by the CSS.
        // We need flat list of slots for the grid layout? 
        // CSS `slot_container` uses `flex-wrap: wrap`.
        // We need to render Row 5 (Top), Row 4... Row 0 (Bottom). 
        // Order: Row 5 Col 0, Row 5 Col 1... 

        for (let row = 5; row >= 0; row--) {
            for (let col = 0; col < 7; col++) {
                this.createSlot(col, row);
            }
        }
    }

    createSlot(col, row) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.dataset.col = col;
        slot.dataset.row = row;

        // Krabby Patty Logic (Secret)
        // 1/5 chance basically if it matches random
        if (row === Math.floor((Math.random() * 5) + 1) && col === Math.floor((Math.random() * 5) + 1)) {
            slot.classList.add('krabby_patty');
        }

        slot.addEventListener('click', () => this.handleSlotClick(col));

        // Hover effects for "Top" logic (Showing ready piece)
        // We can just add hover listener to show ghost piece
        slot.addEventListener('mouseenter', () => this.handleHover(col, true));
        slot.addEventListener('mouseleave', () => this.handleHover(col, false));

        this.els.slotContainer.appendChild(slot);

        // Store in array
        if (!this.div_array[col]) this.div_array[col] = [];
        this.div_array[col][row] = slot;
    }

    handleHover(colIndex, isEnter) {
        if (this.winner_found) return;

        const topSlot = this.div_array[colIndex][5]; // Row 5 is top
        if (!topSlot) return;

        if (isEnter) {
            // Check if top slot is empty (technically if full we shouldn't show?)
            // But usually connect 4 logic implies we can try to drop.
            const img = this.player1 ? 'url("img/spongebob_ready.png")' : 'url("img/patrick_ready.png")';
            topSlot.style.backgroundImage = img;
            topSlot.style.backgroundRepeat = 'no-repeat';
            topSlot.style.backgroundSize = '100%';
        } else {
            topSlot.style.backgroundImage = '';
            topSlot.style.backgroundRepeat = '';
            topSlot.style.backgroundSize = '';
        }
    }

    handleSlotClick(colIndex) {
        if (this.winner_found) return;

        const currentColumn = this.game_array[colIndex];
        // Open slot is the first 'a' from bottom (index 0) up? 
        // game_array was `['a', 'a',...]`. 
        // usually 0 is bottom.
        // Original logic: `var down_to_bottom = current_column.indexOf("a");`
        // `indexOf` finds FIRST occurrence. 
        // If 0 is bottom, and we fill it, it becomes 'R'. Next is 1. 
        // So yes, 0 is bottom.

        const openRowIndex = currentColumn.indexOf('a');
        if (openRowIndex === -1) return; // Column full

        this.playDropSound();

        // Update Logic
        const token = this.player1 ? 'R' : 'B';
        currentColumn[openRowIndex] = token;

        // Visual Update
        const slot = this.div_array[colIndex][openRowIndex];
        this.animateDrop(slot, this.player1);

        // Secret Check
        if (slot.classList.contains('krabby_patty')) {
            this.handleKrabbyPatty(slot);
        } else {
            // Switch Turn (only if NOT krabby patty - logic says "Take another turn" if found)
            this.switchTurn();
        }

        // Check Win
        this.searchSurroundingSlots(colIndex, openRowIndex);
    }

    animateDrop(slot, isPlayer1) {
        const chip = document.createElement('div');
        chip.classList.add('chip');
        chip.classList.add(isPlayer1 ? 'p1' : 'p2');
        slot.appendChild(chip);
    }

    switchTurn() {
        this.player1 = !this.player1;
        this.updateTurnUI();
    }

    updateTurnUI() {
        if (this.player1) {
            this.els.patrick.style.display = 'none';
            this.els.spongebob.style.display = 'block';
            this.els.youare_p.style.display = 'none';
            this.els.youare_s.style.display = 'block';
        } else {
            this.els.spongebob.style.display = 'none';
            this.els.patrick.style.display = 'block';
            this.els.youare_s.style.display = 'none';
            this.els.youare_p.style.display = 'block';
        }
    }

    handleKrabbyPatty(slot) {
        console.log('Secret Krabby Patty found!');

        // Visuals
        // Find the chip we just added
        const chip = slot.querySelector('.chip');
        if (chip) {
            chip.classList.remove('p1', 'p2');
            chip.classList.add(this.player1 ? 'krabby-spongebob' : 'krabby-patrick');
        }

        // Alert / Modal
        // Create a temporary overlay
        const wonDiv = document.createElement('div');
        wonDiv.className = 'you_won'; // Reusing class or making new
        wonDiv.innerHTML = `<div class="modal-overlay"><div class="win-content">
            <img class='patrick_won' src='img/krabbypatty.gif' style="width:200px">
            <h2>Krabby Patty Found!</h2>
            <p>Take another turn!</p>
        </div></div>`;
        document.body.appendChild(wonDiv);

        setTimeout(() => {
            wonDiv.remove();
            // Turn does NOT switch
        }, 3000);
    }

    playDropSound() {
        const audio = document.getElementById('drop');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed', e));
        }
    }

    playWinSound(isPlayer1) {
        const id = isPlayer1 ? 'spongebob_laugh' : 'patrick_laugh';
        const audio = document.getElementById(id);
        if (audio) audio.play();
    }

    resetBoard() {
        this.els.slotContainer.innerHTML = '';
        this.winner_found = false;
        this.player1 = true;
        this.resetCounters();

        // Reset Logic Arrays
        this.game_array = Array(7).fill(null).map(() => Array(6).fill('a'));
        this.div_array = Array(7).fill(null).map(() => Array(6).fill(null)); // Re-init in createBoard

        this.init(); // Re-create grid and reset UI
        this.updateTurnUI();
    }

    hardReset() {
        this.resetBoard();
        this.player1_score = 0;
        this.player2_score = 0;
        this.updateScoreUI();
    }

    updateScoreUI() {
        this.els.p1Score.innerText = this.player1_score;
        this.els.p2Score.innerText = this.player2_score;
    }

    /* Win Detection Logic - Preserved from Original */
    searchSurroundingSlots(colIndex, rowIndex) {
        // preserve exact checks
        // The original code passed `array` (col index) and `index` (row index)
        const array = colIndex;
        const index = rowIndex;

        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (this.winner_found) return;

                this.direction_tracker++;

                // Bounds check
                if (!(j === 0 && i === 0) &&
                    array + i > -1 && array + i < 7 &&
                    index + j > -1 && index + j < 6) {

                    let move_array_position = i;
                    let move_index_position = j;

                    // While current slot matches neighbor...
                    while (
                        this.game_array[array + move_array_position] && // Check col exists
                        this.game_array[array + move_array_position][index + move_index_position] === this.game_array[array][index]
                    ) {
                        this.increaseCounters(this.direction_tracker);

                        if (this.diag1_counter === 3 || this.diag2_counter === 3 || this.horz_counter === 3 || this.vert_counter === 3) {
                            console.log('You win!');
                            this.handleWin();
                            return; // Break out
                        }

                        move_array_position += i;
                        move_index_position += j;

                        // Check bounds for next step
                        if (array + move_array_position < 0 || array + move_array_position > 6 ||
                            index + move_index_position < 0 || index + move_index_position > 5) {
                            break;
                        }
                    }
                }
            }
        }
        this.resetCounters();
    }

    increaseCounters(tracker) {
        switch (tracker) {
            case 1: case 9: this.diag1_counter++; break;
            case 2: case 8: this.horz_counter++; break;
            case 3: case 7: this.diag2_counter++; break;
            case 4: case 6: this.vert_counter++; break;
        }
    }

    resetCounters() {
        this.diag1_counter = 0;
        this.diag2_counter = 0;
        this.horz_counter = 0;
        this.vert_counter = 0;
        this.direction_tracker = 0;
    }

    handleWin() {
        this.winner_found = true;
        this.playWinSound(this.player1); // Current player won (turn hasn't switched if typical flow, wait - we checked AFTER turn switch? No, we check BEFORE switch in original?
        // Original: `handle_slot_click` -> `current_column[...] = 'R'` -> check win. Player1 was still true technically?
        // Original: `this.player1 = false` happened BEFORE win check. 
        // Wait, original logic:
        // 1. `this.player1 = false` (switch flag)
        // 2. Drop token
        // 3. Search win.
        // 4. `who_wins()` -> `if (this.player1 === false) { spongebob won }`
        // So Spongebob (P1) clicks -> flag flips to False -> Win check -> If False, Spongebob won. CORRECT.

        // In my code:
        // 1. Drop token
        // 2. Secret check (maybe switch turn)
        // 3. IF NO SECRET -> `switchTurn()` flips flag.
        // 4. Then Check Win.

        // So if Spongebob plays:
        // P1=true. Drop. Switch -> P1=false. Check Win.
        // So if P1=false, Spongebob won. Same logic.

        if (!this.player1) {
            // Spongebob Won
            this.player1_score++;
            this.showWinModal('Spongebob Wins!', 'img/spongebob_wins.gif');
        } else {
            // Patrick Won
            this.player2_score++;
            this.showWinModal('Patrick Wins!', 'img/patrick_wins.gif');
        }

        this.updateScoreUI();
    }

    showWinModal(text, imgSrc) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="win-content">
                <img class="msg-gif" src="${imgSrc}">
                <h2>${text}</h2>
                <button class="btn-game new_game_modal">Play Again</button>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.new_game_modal').addEventListener('click', () => {
            modal.remove();
            this.resetBoard();
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Connect4();
    window.game.init();
});