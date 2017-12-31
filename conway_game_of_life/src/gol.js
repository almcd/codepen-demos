// Conway's Game of Life
// With thanks to Daniel Shiffman and his book "The Nature of Code" - http://natureofcode.com

(function(){

    // Setup canvas
    const canvas = document.getElementById('canvas');
    // Resize canvas to window
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    
    /**
     * Class to handle individual cell state
     */
    class Cell  {

        /**
         * Initial cell setup
         * @param  {number} x_ - X-axis location of cell in pixels
         * @param  {number} y_ - Y-axis location of cell in pixels
         * @param  {number} w_ - Width of cell
         */
        constructor(x_, y_, w_) {
            this.x = x_;
            this.y = y_;
            this.w = w_;

            let maxWidth = ((Math.round(canvas.width / this.w)) * this.w) - this.w;
            let maxHeight = ((Math.round(canvas.height / this.w)) * this.w) - this.w;

            // Assign cell state randomly (1 or 0)
            this.state = Math.round(Math.random());
        }

        /**
         * Store a copy of the current cell state (1 or 0)
         * This is used for determining cell state and cell styling
         */
        savePrevious() {
            this.previous = this.state;
        }

        /**
         * Store the new state of the cell
         * @param {number} s - 1 or 0 representing the cell state
         */
        newState(s) {
            this.state = s;
        }

        /**
         * Style the cell according to state and displays it on the canvas
         */
        display() {
            if (this.previous == 0 && this.state == 1) {
                // Previously lonely or overpopulated and now reproducing
                ctx.fillStyle = "#7f97a1";
            } else if (this.state == 1) {
                // Reproducing
                ctx.fillStyle = "#2d363d";
            } else if (this.previous == 1 && this.state == 0) {
                // Previously reproduced and now lonely or overpopulated
                ctx.fillStyle = "#10b3d2";
            } else {
                ctx.fillStyle = "#c3d3d2";
            }

            ctx.fillRect(this.x, this.y, this.w, this.w);
        }
    }

    /**
     * Class to handle The Game of Life board
     */
    class GOL {

        /**
         * Initial board setup
         */
        constructor() {
            this.w = 5; // Width of each cell
            this.columns = Math.round(canvas.width / this.w);
            this.rows = Math.round(canvas.height / this.w);
            this.board = [];
            this.genCount = 0;
        }

        /**
         * Set up 2d array for board
         */
        setupBoard() {
            for (let i = 0; i < this.columns; i++) {
                this.board[i] = [];

                for (let j = 0; j < this.rows; j++) {
                    // Create new cell object for each location on board
                    this.board[i][j] = new Cell(i * this.w, j * this.w, this.w);
                }
            }
        }

        /**
         * Generate the next generation of cell states
         */
        generate() {
            // Save current board state
            for (let i = 0; i < this.columns; i++) {
                for (let j = 0; j < this.rows; j++) {
                    this.board[i][j].savePrevious();
                }
            }

            // Loop over board, but skip the edge cells
            for (let x = 0; x < this.columns; x++) {
                for (let y = 0; y < this.rows; y++) {
    
                    // As we visit each cell, add up all the neighbour states to calculate the number of live neighbors
                    let neighbors = 0;
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            // Use the previous cell state when tracking neighbors
                            // Implements a wrap around grid
                            neighbors += this.board[(x+i+this.columns)%this.columns][(y+j+this.rows)%this.rows].previous;
                        }
                    }
                    
                    // Subtract the state of the current cell, as it was included in the count
                    neighbors -= this.board[x][y].previous;
        
                    // Call newState method on the cell object to assign a new state to each cell
                    if ((this.board[x][y].state == 1) && (neighbors <  2)) {
                        this.board[x][y].newState(0); // Loneliness
                    } else if ((this.board[x][y].state == 1) && (neighbors >  3)) {
                        this.board[x][y].newState(0); // Overpopulation
                    } else if ((this.board[x][y].state == 0) && (neighbors == 3)) {
                        this.board[x][y].newState(1); // Reproduction
                    }
                    // else do nothing - stasis
                }
            }

            this.genCount ++;
            //console.log('Generation', this.genCount);
        }

        /**
         * For each position on the board, calls the display method on the cell object
         */
        display() {
            for (let i = 0; i < this.columns; i++) {
                for (let j = 0; j < this.rows; j++) {
                    this.board[i][j].display();
                }
            }
        }
    }

    // Create Game of Life board
    let gol = new GOL();
    gol.setupBoard();

    /**
     * Core animation loop
     */
    let animate = () => {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Call methods on Game of Life board
        gol.generate();
        gol.display();
        
        // Call animation loop recursively
        requestAnimationFrame(animate);
    }

    animate(); // Initial call to animation loop

})();